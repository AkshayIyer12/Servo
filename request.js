const {parseRequest} = require('./parser')
class Request {
  constructor ({method, version, header, URI}) {
    this.method = method
    this.httpVersion = version
    this.headers = header
    this.url = URI
  }
}
const createRequest = (data) => new Request(parseRequest(data))

module.exports = {
  createRequest
}
