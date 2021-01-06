const   http = require("http"),
        socketIo = require("socket.io");
module.exports = (app) => {
    const server = http.createServer(app);
    const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        //methods: ["GET", "POST"]
    }
    });
    io.on("connection", (socket) => {
        
    });
    server.listen(process.env.PORT || 8000, () => console.log(`Listening on port ${process.env.PORT || 8000}`));
    return {io: io};
};