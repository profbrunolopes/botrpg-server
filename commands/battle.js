const fs = require("fs");

var canIngress = true;
var gameStarted = false;
var roundPlayers = false;
const ingressTime = 10000;
const roundTime = 10000;

participants = [];

function battle(message, user, client, io) {
  const streamer = url.replace("#", "");
  if (message == "!batalha" && user.username == streamer) {
    fs.writeFileSync("battle.txt", "true");
    fs.writeFileSync("data.txt", `${new Date()}`);
  }
  if (message == "!alistar" && canIngress === true) {
    if (fs.readFileSync("battle.txt", "utf8") == "true") {
      index = participants.indexOf(user.username);
      if (index == -1) {
        participants.push(user.username);
      }
    }
  }

  // test if the ingressTime has passed
  try {
    let dataString = fs.readFileSync("data.txt", "utf8");
    date = new Date(dataString);
    dateNow = new Date();

    if (dateNow - date >= ingressTime && gameStarted === false) {
      gameStarted = true;
      canIngress = false;
      client.action(url, "Acabou o tempo. começando a batalha");
    }
  } catch (err) {
    console.log(err);
  }

  if (gameStarted === true) {
    setInterval(() => {
      console.log("New Round");
      roundPlayers ? io.emit("round", "players") : io.emit("round", "monster");
    }, 10000);
  }
}

module.exports = battle;
