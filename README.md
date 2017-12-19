# Servo
A basic http server using node net module.

## How to run the server?
1. Import the server module.
2. createServer method takes a port to start a server.

## Which all Modules are used?
1. Node net module

### Response object methods
* res.setHeader('field', 'value'): It takes two parameters a header field and
header field value and set it to the response object headers.
* res.getHeaders(): It will fetch the headers of response object.
* res.write(data): takes a string data and add's it to the body.
* res.end(): write to the socket connection. It does not take any parameter.