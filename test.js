const http = require('./server')
const bodyParser = require('./bodyParser')
const {staticFileHandler} = require('./staticFileHandler')

http.createServer(4000)
http.use(http.logger)
http.use(bodyParser.parseMultipart)

http.addRoutes('GET', '/', (req, res) => {
  res.write('<h1>Geekskool</h1>')
  res.write('<p>Ping!!! You made a GET Request</p>')
  res.end()
})

http.addRoutes('GET', ['/login', '/logout'], (req, res) => {
  res.write('This is common for all routes')
  res.end()
})

http.addRoutes('POST', '/', (req, res) => {
  res.write('Hello Monday Morning!')
  res.setHeader('Content-Type', 'text/plain')
  res.end()
})

http.addRoutes('GET', '/user/:Userid/task/:taskId', (req, res) => {
  console.log('I got some param! :\n', req.params)
  res.write(JSON.stringify({status: 'success', message: 'Success message'}))
  res.end()
})

http.addRoutes('GET', '/task/:taskId/user/:userId', (req, res) => {
  res.write(JSON.stringify({status: 'error', message: 'Error message'}))
  res.end()
})

http.addRoutes('POST', '/user', (req, res) => {
  res.write('Data Received!!!')
  res.setHeader('Content-Type', 'text/plain')
  res.end()
})
