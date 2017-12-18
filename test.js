let http = require('./server')
http.createServer(4000, (req, res) => {
  console.log(req, res)
  res.write('<h1>Geekskool</h1>')
  res.write('<p>Ping!!!</p>')
  res.end()
})
