const compose = (f, g) => x => f(g(x))

const parseJSON = req => {
  if (req.headers['Content-Type'] === 'application/json') {
    req.body = JSON.parse(req.body.toString())
    return req
  }
  return null
}

const parsePlainText = req => {
  if (req.headers['Content-Type'] === 'text/plain') {
    req.body = req.body.toString()
    return req
  }
  return null
}

const parseURLEncoded = req => {
  if (req.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    let data = req.body.toString().split('&').reduce((accum, v) => {
      let val = v.split('=')
      accum[val[0]] = val[1]
      return accum
    }, {})
    req.body = data
    return req
  }
  return null
}

const parseMultipart = req => {
  if (req.headers['Content-Type'].slice(0, 19) === 'multipart/form-data') {
    let [body, files] = compose(parseParts, getParts)(req)
    req.body = body
    req.files = files
    return req
  }
  return null
}

const getParts = req => {
  let index = req.headers['Content-Type'].indexOf('=')
  let boundary = req.headers['Content-Type'].slice(index + 1)
  let tempBody = req.body
  let arr = []
  while (tempBody.indexOf('--' + boundary + '--') > 0) {
    let chunk = tempBody.slice(boundary.length + 4, tempBody.indexOf('--' +
    boundary, boundary.length + 4))
    arr.push(chunk)
    tempBody = tempBody.slice(boundary.length + 4 + chunk.length)
  }
  return [arr, boundary]
}

const parseParts = ([arr, boundary]) => {
  let files = {}, fname = ''
  let parsedBody = arr.reduce((accum, a) => {
    let header = a.slice(0, a.indexOf('\r\n\r\n')).toString('utf-8').split('\r\n')
    let body = a.slice(a.indexOf('\r\n\r\n') + 4)
    if (header[0].includes('filename')) {
      [files, fname] = getKeyValue(header[0], body)
      accum.filenames.push(fname)
    } else {
      let key = header[0].slice(header[0].indexOf('=') + 1)
      accum[key.slice(1, key.length - 1)] = body
    }
    return accum
  }, {
    filenames: []
  })
  return [parsedBody, files]
}

const getKeyValue = (data, body) => {
  let obj = {}
  let key = data.slice(data.indexOf('=') + 2, data.lastIndexOf(';') - 1)
  let val = data.slice(data.indexOf('filename') + 10, data.lastIndexOf('"'))
  obj[key] = Buffer.from(body)
  return [obj, val]
}

module.exports = {
  parseJSON,
  parseURLEncoded,
  parseMultipart,
  parsePlainText
}
