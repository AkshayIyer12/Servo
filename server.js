const net = require('net')
const {createResponse} = require('./response')
const {createRequest} = require('./request')
const {parseJSON, parseURLEncoded, parseMultipart, parsePlainText} = require('./bodyParser')
const routes = {
  'GET': {},
  'POST': {}
}

const createServer = (port) => {
  let server = net.createServer(socket => {
    console.log('client connected')
    socket.on('end', () => {
      console.log('Client Disconnected')
    })
    dataEventHandler(socket)
    socket.setTimeout(50000)
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
      bufferBody = Buffer.concat([bufferReq, bufferBody], bufferReq.length + bufferBody.length)
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
  if (req.method === 'POST') {
    req.body = body
  }
  [req] = parserFactory(parseJSON, parseURLEncoded, parsePlainText, parseMultipart)(req)
  routes[req.method][req.url](req, res)
}

const parserFactory = (...parsers) => req => {
  return parsers.reduce((accum, parser) => {
    let val = parser(req)
    if (val !== null) {
      accum.push(val)
    }
    return accum
  }, [])
}

const addRoutes = (method, route, cb) => {
  routes[method][route] = cb
}

const getHeaderAndBody = data => {
  let header = data.slice(0, data.indexOf('\r\n\r\n'))
  let body = data.slice(data.indexOf('\r\n\r\n') + 4)
  return {header, body}
}

module.exports = {
  createServer,
  addRoutes
}
