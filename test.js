let http = require('./server')
http.createServer(4000)
http.addRoutes('GET', '/', (req, res) => {
  res.write('<h1>Geekskool</h1>')
  res.write('<p>Ping!!!</p>')
  res.end()
})
http.addRoutes('POST', '/', (req, res) => {
  res.write('Hello Geekskool, there is a hackathon this saturday')
  res.setHeader('Content-Type', 'text/plain')
  res.end()
})
http.addRoutes('GET', '/user', (req, res) => {
  res.write(JSON.stringify({status: 'error', message: 'yo'}))
  res.end()
})
http.addRoutes('POST', '/user', (req, res) => {
  res.write('Data Received!!!')
  console.log(req.body)
  res.setHeader('Content-Type', 'text/plain')
  res.end()
})
