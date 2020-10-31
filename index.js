const tmi = require("tmi.js");
const options = require("./options");
const io = require("./socket");

// tmi IRC part

const client = new tmi.client(options);
const battle = require("./commands/battle");

url = options.channels[0];

client.connect();

client.on("connected", (address, port) => {});

client.on("chat", (channel, user, message, self) => {
  battle(message, user, client, io);
});
