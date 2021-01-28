module.exports = (session, type, message, payload) =>
  io.to(session.socketRoom).emit(type, { message, payload });
