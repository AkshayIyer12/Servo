const net = require('net')
let server = net.createServer(socket => {
  console.log('client connected')
  socket.on('end', () => console.log('client disconnected'))
  socket.on('data', data => console.log(data.toString('utf-8')))
  socket.write(JSON.stringify({status: 200, body: 'Hello World'}))
})
server.on('error', err => {
  throw err
})
server.listen(3000, () => console.log('server bound'))
