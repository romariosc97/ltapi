const http = require("http"),
      sock = require("socket.io");

module.exports = (server) => {

  const socketOptions = {}

  const io = sock(server, socketOptions)

  io.on('connection', socket => {
    console.log("client connected. Assigning room...")
    socket.on('setSessionRoom', (sessionId) => {
      socket.join(roomId)
    })
  })

  return io

}
