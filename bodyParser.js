
const parseJSON = (req, res) => {
  req.body = JSON.parse(req.body.toString())
  return [req, res]
}

const parsePlainText = (req, res) => {
  req.body = req.body.toString()
  return [res, res]
}

const parseURLEncoded = (req, res) => {
  let data = req.body.toString().split('&').reduce((accum, v) => {
    let val = v.split('=')
    accum[val[0]] = val[1]
    return accum
  }, {})
  req.body = data
  return [req, res]
}

const parseMultipart = (req, res) => {
  let boundary = req.headers['Content-Type']
  .slice(21, req.headers['Content-Type'].length)
  .split('=')[1]
  let splitter = req.body.split('--' + boundary + '\r\n')
  let newSplitter = splitter
  .slice(1)
  .map(a => a.slice(a.indexOf(';') + 2))
  let final = newSplitter[newSplitter.length - 1].indexOf('--' + boundary + '--')
  newSplitter[newSplitter.length - 1] = newSplitter[newSplitter.length - 1]
  .slice(0, final)
  let newData = newSplitter.map(a => a.trim())
  newData = newData.map(a => a.split('\r\n\r\n'))
  .reduce((a, v) => {
    let key = v[0].split('=')[1].split('').filter(a => {
      if (a !== '"') return a
    }).join('')
    let val = v[1]
    a[key] = val
    return a
  }, {})
  req.body = newData
  return [req, res]
}

module.exports = {
  parseJSON,
  parseURLEncoded,
  parseMultipart,
  parsePlainText
}
