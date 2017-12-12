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

let message = {
  headers: {},
  httpVersion: '',
  method: ''
}

const parseRequest = data => {
  let requestMessage = data.toString('utf-8').trim().split('\r\n')
  parseStatusLine(requestMessage[0])
  let headers = requestMessage.slice(1)
  parseHeaders(headers)
}

const parseHeaders = headers => {
  for (let key of headers) {
    let findColon = key.indexOf(':')
    message.headers[key.slice(0, findColon)] = key.slice(findColon + 1,
      key.length).trim()
  }
}

const parseStatusLine = data => {
  let statusLine = data.split(' ')
  message.method = statusLine[0]
  message.httpVersion = statusLine[2].split('/')[1]
}
