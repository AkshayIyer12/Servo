const net = require('net')
const Response = require('./response')
const routes = {
  GET: {},
  POST: {}
}
const startServer = port => {
  let server = net.createServer(socket => {
    console.log('client connected')
    socket.on('end', () => console.log('Client Disconnected'))
    socket.on('data', data => createResponse(parseRequest(data), socket))
  })
  server.on('error', err => { throw err })
  server.listen(port, () => console.log(`Server bound on ${port}`))
}

const parseRequest = data => {
  let message = {}
  let newData = data.toString('utf-8')
  let [rawStatusLine, rawHeaders] = separateStatusHeader(newData)
  let {method, version, URI} = parseStatusLine(rawStatusLine)
  let header = parseHeaders(rawHeaders)
  message.method = method
  message.httpVersion = version
  message.headers = header
  message.url = URI
  return message
}

const separateStatusHeader = data => {
  let statusLineEnd = data.indexOf('\r\n')
  let headerLineEnd = data.indexOf('\r\n\r\n')
  let rawStatusLine = data.slice(0, statusLineEnd)
  let rawHeaders = data.slice(statusLineEnd + 1, headerLineEnd)
  return [rawStatusLine, rawHeaders]
}

const parseHeaders = headers => {
  let arr = headers.trim().split('\r\n')
  let header = {}
  for (let key of arr) {
    let findColon = key.indexOf(':')
    header[key.slice(0, findColon).toLowerCase()] = key.slice(findColon + 1,
      key.length).trim()
  }
  return header
}

const parseStatusLine = data => {
  let statusLine = data.split(' ')
  let method = statusLine[0]
  let URI = statusLine[1]
  let version = statusLine[2].split('/')[1]
  return {
    method,
    URI,
    version
  }
}

const createResponse = (req, socket) => {
  let res = new Response(socket)
  if (req.method === 'GET') {
    routes[req.method][req.url](req, res)
  }
}

const addRoutes = (method, route, cb) => {
  routes[method][route] = cb
  return routes
}

module.exports = {
  startServer,
  addRoutes
}
