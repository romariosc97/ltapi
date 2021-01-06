const http = require("http"),
      sock = require("socket.io");

module.exports = (server) => {

  const socketOptions = {
    cors: { origin: "*" }
  }

  const io = sock(server, socketOptions)

  // io.on('connection', (socket) => {
  //   console.log('New socket connection.')
  // })

  return io

}
