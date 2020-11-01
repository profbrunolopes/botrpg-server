const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const tmi = require("tmi.js");
const options = require("./options");

app.use(express.static(path.join(__dirname, "pages")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pages/index.html");
});

io.on("connection", (socket) => {
  const client = new tmi.client(options);
  const battle = require("./commands/battle");

  url = options.channels[0];

  client.connect();

  client.on("connected", (address, port) => {});

  client.on("chat", (channel, user, message, self) => {
    battle(message, user, client, socket);
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
