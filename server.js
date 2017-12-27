const net = require('net')
const fs = require('fs')
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
  req.handlers.push(methodHandler)
  if (req.method === 'POST') {
    req.body = body
  }
  next(req, res)
}

const methodHandler = (req, res, next) => {
  req.params = generateParams(req)
  if (routes[req.method].hasOwnProperty(req.url)) {
      routes[req.method][req.url](req, res)
  }
  if (routes[req.method].hasOwnProperty(req.params[req.url])) {
    routes[req.method][req.params[req.url]](req, res)
  } else {
      res.setStatus(404)
      res.write('<h1>Resource Not Found!!!</h1>')
      res.setHeader('Content-Type', 'text/html')
      res.end()
  }
}

const generateParams = req => {
  return Object.keys(routes[req.method])
  .reduce((accum, val) => {
    let routeURL = val.split('/')
    let reqURL = req.url.split('/')
    if (routeURL.length === reqURL.length) {
      for (let i = 1; i < reqURL.length; i++) {
        if (routeURL[i][0] === ':') {
          if (reqURL[i-1] === routeURL[i-1]) {
            let key = routeURL[i].slice(1, routeURL[i].length)
            let val = reqURL[i]
            accum[key] = val
            let fullReqURL = reqURL.join('/')
            let fullRouteURL = routeURL.join('/')
            accum[fullReqURL] = fullRouteURL
          }
        }
      }
    }
    return accum
  }, {})
}

const next = (req, res) => {
  let handler = req.handlers.shift()
  handler(req, res, next)
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

const logger = (req, res, next) => {
  console.log(req.handlers)
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
  use,
  logger
}
