let http = require('./server')
http.createServer(4000)

http.use(http.staticFileHandler('public'))
http.use(http.logger)
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

http.addRoutes('GET', '/user', (req, res) => {
  res.write(JSON.stringify({status: 'error', message: 'Error Message'}))
  res.end()
})

http.addRoutes('POST', '/user', (req, res) => {
  res.write('Data Received!!!')
  res.setHeader('Content-Type', 'text/plain')
  res.end()
})
