function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const fs = require("fs");

var canIngress = true;
var gameStarted = false;
var intervalStarted = false;
var gamePreStarted = false;
var roundPlayers = false;
var gameInterval;
const ingressTime = 40000;
const roundTime = 10000;

participants = [];

monsterLife = 200;

function battle(message, user, client, socket) {
  const streamer = url.replace("#", "");
  if (message == "!batalha" && user.username == "edersondeveloper") {
    fs.writeFileSync("battle.txt", "true");
    fs.writeFileSync("data.txt", `${new Date()}`);
    client.action(url, "Digite !alistar para se alistar!");

    gamePreStarted = true;
    socket.emit("start", true);
  }
  if (message == "!alistar" && canIngress === true) {
    if (fs.readFileSync("battle.txt", "utf8") == "true") {
      index = participants.indexOf(user.username);
      if (index == -1) {
        participants.push({ player: user.username, life: 100 });
      }
    }
  }
  console.log(participants);
  console.log(
    message == "!atacar" &&
      canIngress === false &&
      gameStarted &&
      roundPlayers &&
      participants.findIndex((i) => i.player != -1)
  );

  try {
    if (
      message == "!atacar" &&
      canIngress === false &&
      gameStarted &&
      roundPlayers &&
      participants.findIndex((i) => i.player === user.username) != -1
    ) {
      damage = getRndInteger(5, 50);
      monsterLife -= damage;
      data = { player: user.username, life: monsterLife };
      client.action(
        url,
        `${user.username} Atacou o monstro, tirando ${damage} pontos de vida!`
      );
      socket.emit("attackPlayer", JSON.stringify(data));
      if (monsterLife <= 0) {
        client.action(url, `O monstro morreu!`);
        socket.emit("monsterDeath", true);
        gameStarted = false;
        gamePreStarted = false;
        clearInterval(gameInterval);
      }
    }
  } catch (err) {
    console.log(err);
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
  if (gameStarted === true && intervalStarted == false) {
    intervalStarted = true;
    gameInterval = setInterval(() => {
      if (roundPlayers === false) {
        socket.emit("round", "players");
        client.action(url, "Round dos jogadores");

        participants.forEach((element) => {
          client.action(url, `${element.player} Sua vez de atacar!`);
        });

        roundPlayers = true;
      } else {
        socket.emit("round", "monster");
        client.action(url, "Round do monstro");

        for (i = 0; i < participants.length; i++) {
          element = participants[i];

          damage = getRndInteger(5, 10);
          client.action(
            url,
            `O monstro tirou ${damage} pontos de vida de ${element.player}`
          );
          element.life -= damage;
          if (element.life <= 0) {
            client.action(url, `${element.player} morreu!`);

            socket.emit("playerDeath", element.player);
            delete participants[i];
          }
        }

        roundPlayers = false;
      }
    }, roundTime);
  }
}

module.exports = battle;
