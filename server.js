const net = require('net')
const {createResponse} = require('./response')
const {createRequest} = require('./request')
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
    socket.setTimeout(6000)
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
      if (req.headers['Content-Length'] === undefined ||
      parseInt(req.headers['Content-Length'] === bufferBody.length)) {
        let res = createResponse(socket)
        requestHandler(req, res, bufferBody.toString())
        bufferReq = Buffer.from([])
        bufferBody = Buffer.from([])
        flag = false
        req = {}
      }
    }
  })
}

const requestHandler = (req, res, body) => {
  if (req.method === 'POST') req.body = body
  routes[req.method][req.url](req, res)
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
