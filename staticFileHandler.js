const fs = require('fs')
const path = require('path')

const staticFileHandler = file => (req, res, next) => {
  let url = path.join(__dirname, file, req.url)
  fs.readFile(url, (err, data) => {
    if (err) {
      next(req, res)
      return
    }
    let body = data.toString()
    res.write(body)
    res.setHeader('Content-Type', 'text/html')
    res.end()
  })
}
module.exports = {
  staticFileHandler
}