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
  constructor (socket) {
    this.message = {
      version: '1.1',
      statusCode: 200,
      statusMessage: 'OK',
      headers: {
        Date: new Date().toUTCString()
      },
      body: ''
    }
    this.socket = socket
  }
  setStatus (code) {
    let self = this.message
    self.statusCode = code
    self.statusMessage = status[code]
  }
  setHeader (field, value) {
    let self = this.message.headers
    self[field] = value
  }
  getHeaders () {
    return this.message.headers
  }
  giveResponse () {
    let { version, statusCode, statusMessage, headers } = this.message, str = ''
    str += `HTTP/${version} ${statusCode} ${statusMessage}` + CRLF
    for (let i in headers) {
      if (headers.hasOwnProperty(i)) {
        str += `${i}: ${headers[i]}${CRLF}`
      }
    }
    str += CRLF
    return str
  }
  write (data) {
    let self = this.message
    self.body += data
    if (self.body !== undefined) self.headers['Content-Length'] = self.body.length
  }
  end () {
    let str = this.giveResponse()
    let self = this.message.headers
    if (self['Content-Length']) str += this.message.body
    if (self['Content-Type'] === undefined) {
      self['Content-Type'] = contentType['.txt']
    }
    this.socket.write(str)
  }
}

const createResponse = socket => new Response(socket)

module.exports = {
  createResponse
}
