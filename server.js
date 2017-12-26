const net = require('net')
const fs = require('fs')
const path = require('path')
const {createResponse} = require('./response')
const {createRequest} = require('./request')
const {parseJSON, parseURLEncoded, parseMultipart, parsePlainText} = require('./bodyParser')
const routes = {
  'GET': {},
  'POST': {}
}
let middlewareArr = []
const createServer = (port) => {
  let server = net.createServer(socket => {
    console.log('client connected')
    dataEventHandler(socket)
    socket.on('end', () => {
      console.log('Client Disconnected')
    })
    socket.setTimeout(20000)
    socket.on('timeout', () => {
      console.log('Socket Timeout')
      socket.end()
    })
  })
  server.on('error', err => { throw err })
  server.listen(port, () => console.log(`Server bound on ${port}`))
}

const dataEventHandler = (socket) => {
  let bufferReq = Buffer.from([])
  let bufferBody = Buffer.from([])
  let flag = false
  let req
  socket.on('data', data => {
    if (flag) {
      bufferBody = Buffer.concat([bufferBody, data], bufferBody.length + data.length)
    }
    bufferReq = Buffer.concat([bufferReq, data], bufferReq.length + data.length)
    if (bufferReq.includes('\r\n\r\n')) {
      if (!flag) {
        let {header, body} = getHeaderAndBody(bufferReq)
        req = createRequest(header)
        bufferBody = Buffer.from(body)
        flag = true
      }
      if (parseInt(req.headers['Content-Length']) === bufferBody.length ||
      req.headers['Content-Length'] === undefined) {
        let res = createResponse(socket)
        requestHandler(req, res, bufferBody)
        bufferReq = Buffer.from([])
        bufferBody = Buffer.from([])
        flag = false
        req = {}
      }
    }
  })
}

const requestHandler = (req, res, body) => {
  req.handlers = [...middlewareArr]
  req.handlers.push(routes[req.method][req.url])
  if (req.method === 'POST') {
    req.body = body
    req = parserFactory(parseJSON, parseURLEncoded, parsePlainText, parseMultipart)(req)
  }
  next(req, res)
}

const next = (req, res) => {
  let handler = req.handlers.shift()
  handler(req, res, next)
}

const parserFactory = (...parsers) => req => {
  return parsers.reduce((accum, parser) => {
    return accum === null ? parser(req) : accum
  }, null)
}

const addRoutes = (method, route, cb) => {
  if (Array.isArray(route)) {
    route.forEach(r => {
      routes[method][r] = cb
    })
  } else {
    routes[method][route] = cb
  }
}

const use = v => middlewareArr.push(v)

const staticFileHandler = file => (req, res, next) => {
  let url = path.join(__dirname, file, req.url)
  fs.readFile(url, (err, data) => {
    if (err) {
      next(req, res)
      return
    }
    let body = data.toString()
    res.write(body)
    res.setHeader('Content-Type', 'text/html')
    res.end()
  })
}

const logger = (req, res, next) => {
  console.log(req)
  next(req, res)
}

const getHeaderAndBody = data => {
  let header = data.slice(0, data.indexOf('\r\n\r\n'))
  let body = data.slice(data.indexOf('\r\n\r\n') + 4)
  return {header, body}
}

module.exports = {
  createServer,
  addRoutes,
  staticFileHandler,
  use,
  logger
}
