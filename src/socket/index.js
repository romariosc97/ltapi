const http = require("http"),
      sock = require("socket.io");

module.exports = (server) => {

  const socketOptions = {
    cors: { origin: "*" }
  }

  const io = sock(server, socketOptions)

  return io

}
