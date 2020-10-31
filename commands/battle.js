const fs = require("fs");

var canIngress = true;
var gameStarted = false;
var gamePreStarted = false;
var roundPlayers = true;
const ingressTime = 10000;
const roundTime = 10000;

participants = [];

function battle(message, user, client, socket) {
  const streamer = url.replace("#", "");
  if (message == "!batalha" && user.username == streamer) {
    fs.writeFileSync("battle.txt", "true");
    fs.writeFileSync("data.txt", `${new Date()}`);

    gamePreStarted = true;
    socket.emit("start", true);
  }
  if (message == "!alistar" && canIngress === true) {
    if (fs.readFileSync("battle.txt", "utf8") == "true") {
      index = participants.indexOf(user.username);
      if (index == -1) {
        participants.push(user.username);
      }
    }
  }
  if (
    message == "!atacar" &&
    canIngress === false &&
    gameStarted &&
    roundPlayers
  ) {
    console.log(roundPlayers);
    socket.emit("attackPlayer", { user: user.username, damage: 10 });
  }

  // test if the ingressTime has passed
  try {
    let dataString = fs.readFileSync("data.txt", "utf8");
    date = new Date(dataString);
    dateNow = new Date();

    if (
      dateNow - date >= ingressTime &&
      gameStarted === false &&
      gamePreStarted
    ) {
      gameStarted = true;
      canIngress = false;
      client.action(url, "Acabou o tempo. começando a batalha");
      socket.emit("players", JSON.stringify(participants));
    }
  } catch (err) {}
  if (gameStarted === true) {
    setInterval(() => {
      console.log("New Round");
      if (roundPlayers) {
        socket.emit("round", "players");
        console.log("Player");
        roundPlayers = false;
        client.action(url, "Round dos jogadores");
      } else {
        socket.emit("round", "monster");
        console.log("Monstro");
        socket.emit("attackMonster", 10);
        roundPlayers = true;
        client.action(url, "Round do monstro");
      }
    }, 10000);
  }
}

module.exports = battle;
