const path = require('path')
const CRLF = '\r\n'
const status = {
  200: 'OK',
  404: 'Not Found'
}
const contentType = {
  '.html': 'text/html',
  '.txt': 'text/plain'
}
class Response {
  constructor () {
    this.message = {
      version: '1.1',
      statusCode: 200,
      statusMessage: 'OK',
      headers: {
        Date: new Date().toUTCString()
      },
      body: ''
    }
  }
  setStatus (code) {
    let self = this.message
    self.statusCode = code
    self.statusMessage = status[code]
  }
  setContentType (url) {
    let self = this.message.headers
    let ext = path.extname(url)
    self['Content-Type'] = contentType[ext]
  }
  setHeaders (field, value) {
    let self = this.message.headers
    self[field] = value
  }
  giveResponse () {
    let { version, statusCode, statusMessage, headers, body } = this.message, str = ''
    str += `HTTP/${version} ${statusCode} ${statusMessage}` + CRLF
    for (let i in headers) {
      if (headers.hasOwnProperty(i)) {
        str += `${i}: ${headers[i]}${CRLF}`
      }
    }
    str += CRLF + body
    return str
  }
  send (data) {
    let self = this.message
    self.body = data
    if (self.body !== undefined) self.headers['Content-Length'] = self.body.length
  }
}

module.exports = Response
