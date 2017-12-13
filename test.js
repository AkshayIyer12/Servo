let {fireServer, addRoutes} = require('./server')
fireServer(3000)
addRoutes('GET', '/', (req, res) => {
  res.body = 'Yo'
})
