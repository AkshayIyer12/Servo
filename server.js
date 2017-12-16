const net = require('net')
// const {createResponse} = require('./response')
const {createRequest} = require('./request')
// let connectionHandler = null

const createServer = port => {
  let server = net.createServer(socket => {
    console.log('client connected')
    socket.on('end', () => {
      console.log('Client Disconnected')
    })
    socket.on('data', data => {
      console.log('Getting Data!')
      console.log(data.toString())
    })
    socket.setTimeout(4000)
    socket.on('timeout', () => {
      console.log('Socket Timeout')
      socket.end()
    })
  })
  server.on('error', err => { throw err })
  server.listen(port, () => console.log(`Server bound on ${port}`))
}
module.exports = {
  createServer
}
