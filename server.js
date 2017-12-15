const net = require('net')
const Response = require('./response')
// const path = require('path')
// const fs = require('fs')
const routes = {
  GET: {},
  POST: {}
}
// let flag = 0
const startServer = port => {
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
  let [rawStatusLine, rawHeaders, body] = separateData(newData)
  let {method, version, URI} = parseStatusLine(rawStatusLine)
  let header = parseHeaders(rawHeaders)
  // if (flag > 0) {
  //   body = addStaticFile(URI)
  // }
  message.method = method
  message.httpVersion = version
  message.headers = header
  message.url = URI
  message.body = body
  return message
}

const separateData = data => {
  let statusLineEnd = data.indexOf('\r\n')
  let headerLineEnd = data.indexOf('\r\n\r\n')
  let rawStatusLine = data.slice(0, statusLineEnd)
  let rawHeaders = data.slice(statusLineEnd + 1, headerLineEnd)
  let body = data.slice(headerLineEnd + 1, data.length)
  return [rawStatusLine, rawHeaders, body]
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

const createResponse = (req) => {
  let res = new Response()
  if (req.method === 'GET') {
    routes[req.method][req.url](req, res)
  }
  return res.giveResponse()
}

const addRoutes = (method, route, cb) => {
  routes[method][route] = cb
  return routes
}

const print = (value, socket) => {
  socket.write(value)
}

// const addStaticFile = (URI) => {
//   flag++
//   if (URI !== undefined) {
//     let directory = path.join(__dirname, `public`, URI)
//     return fs.readFileSync(directory, 'utf-8', (err, data) => {
//       if (err) throw err
//       else return data
//     })
//   }
// }

module.exports = {
  startServer,
  addRoutes
//  addStaticFile
}
