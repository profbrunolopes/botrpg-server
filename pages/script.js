var socket = io();
socket.emit("message", "hello");

io.on("connection", (socket) => {
  socket.on("round", (msg) => {
    console.log(msg);
  });
});
