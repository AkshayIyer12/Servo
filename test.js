let {startServer, addRoutes} = require('./server')
startServer(3000)
addRoutes('GET', '/index', (req, res) => {
  console.log('im here')
  res.setContentType('./index.txt')
  res.send('Servo !!!')
})
