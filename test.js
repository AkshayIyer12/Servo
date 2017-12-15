let {startServer, addRoutes} = require('./server')
startServer(3000)
// addStaticFile()
addRoutes('GET', '/index', (req, res) => {
  console.log('im here')
  res.send('Hello World')
})
