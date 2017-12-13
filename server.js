const net = require('net')

const routes = {
  GET: {},
  POST: {}
}

const fireServer = port => {
  let server = net.createServer(socket => {
    console.log('client connected')
    socket.on('end', () => console.log('Client Disconnected'))
    socket.on('data', data => print(createResponse(parseRequest(data)), socket))
  })
  server.on('error', err => { throw err })
  server.listen(port, () => console.log(`Server bound on ${port}`))
}

const parseRequest = data => {
  let message = {}
  let newData = data.toString('utf-8')
  let statusLineEnd = newData.indexOf('\r\n')
  let headerLineEnd = newData.indexOf('\r\n\r\n')
  let rawStatusLine = newData.slice(0, statusLineEnd)
  let rawHeaders = newData.slice(statusLineEnd + 1, headerLineEnd)
  let {
    method,
    version,
    URI
  } = parseStatusLine(rawStatusLine)
  let header = parseHeaders(rawHeaders)
  let body = newData.slice(headerLineEnd + 1, newData.length).trim()
  message.method = method
  message.httpVersion = version
  message.headers = header
  message.url = URI
  message.body = body
  return message
}

const parseHeaders = headers => {
  let arr = headers.trim().split('\r\n')
  let header = {}
  for (let key of arr) {
    let findColon = key.indexOf(':')
    header[key.slice(0, findColon)] = key.slice(findColon + 1,
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

const createResponse = (message) => {
  let res = {}
  if (message.method === 'GET') routes[message.method][message.url](message, res)
  return createResMsg(message, res)
}

const createResMsg = (msg, res) => {
  return `HTTP/${msg.httpVersion} 200 OK\r\nContent-Length: ${res.body.length}\r\nContent-Type: text/plain\r\n\r\n${res.body}`
}

const addRoutes = (method, route, cb) => {
  routes[method][route] = cb
}

const print = (value, socket) => socket.write(value)

module.exports = {
  fireServer,
  addRoutes
}
