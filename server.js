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
  let responseMessage = data.toString('utf-8').trim().split('\r\n')
  parseStatusLine(responseMessage[0])
  let headers = responseMessage.slice(1)
  for (let key of headers) {
    let findColon = key.indexOf(':')
    message.headers[key.slice(0, findColon)] = key.slice(findColon + 1, key.length)
  }
}

const parseStatusLine = data => {
  let statusLine = data.split(' ')
  message.method = statusLine[0]
  message.httpVersion = statusLine[2].split('/')[1]
}
