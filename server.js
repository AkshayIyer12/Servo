const net = require('net')

let server = net.createServer(socket => {
  console.log('client connected')
  socket.on('end', () => console.log('client disconnected'))
  socket.on('data', data => parseRequest(data))
})

server.on('error', err => {
  throw err
})

server.listen(3000, () => console.log('server bound'))

const parseRequest = data => {
  let message = {}
  let newData = data.toString('utf-8')
  let statusLineEnd = newData.indexOf('\r\n')
  let headerLineEnd = newData.indexOf('\r\n\r\n')
  let rawStatusLine = newData.slice(0, statusLineEnd)
  let rawHeaders = newData.slice(statusLineEnd + 1, headerLineEnd)
  let {method, version, URI} = parseStatusLine(rawStatusLine)
  let header = parseHeaders(rawHeaders)
  let body = newData.slice(headerLineEnd + 1, newData.length).trim()
  message.method = method
  message.httpVersion = version
  message.header = header
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
  return {method, URI, version}
}
