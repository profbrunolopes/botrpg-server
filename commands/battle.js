function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function roundPlayersExec(socket, client) {
  roundNumber++;
  if (!roundPlayers) {
    socket.emit("round", "players");
    client.action(url, "Round dos Jogadores!");

    participants.forEach((element) => {
      if (!element.dead) {
        client.action(url, `${element.player} Sua vez de agir!`);
      }
      element.lastCommand = 1;
    });

    roundPlayers = true;
  } else {
    socket.emit("round", "monster");
    client.action(url, "Round do NPC!");

    for (i = 0; i < participants.length; i++) {
      element = participants[i];
      damage = getRndInteger(10, 30);

      if (element.defenseChance != -1) {
        damage = Math.floor(damage * (1 - element.defenseChance / 100));
        element.defenseChance = -1;
      }
      element.life -= damage;

      if (element.life < 0) {
        element.life = 0;
      }

      client.action(
        url,
        `O monstro tirou ${damage} pontos de vida de ${element.player} e sobrou ${element.life} pontos de vida`
      );
      if (element.life <= 0 && !participants[i].dead) {
        client.action(url, `${element.player} morreu!`);

        socket.emit("playerDeath", element.player);
        participants[i].dead = true;
        deads.push(participants[i]);
        participants.splice(i, 1);
      }
    }

    roundPlayers = false;
  }
}

const fs = require("fs");
const username = "profbrunolopes";

deads = [];
var canIngress = true;
var gameStarted = false;
var intervalStarted = false;
var gamePreStarted = false;
var roundPlayers = false;
var gameInterval;
const ingressTime = 40000;
var roundNumber = 0;
const roundTime = 31000;

participants = [];

const monster = {
  id: 1,
  life: 0,
};

function battle(message, user, client, socket) {
  //const streamer = url.replace("#", "");

  try {
    if (message == "!batalha" && user.username == username) {
      fs.writeFileSync("battle.txt", "true");
      fs.writeFileSync("data.txt", `${new Date()}`);
      client.action(
        url,
        "Digite !alistar para se alistar! Use !atacar, !defender e !salvar"
      );

      gamePreStarted = true;
      socket.emit("start", true);
    }
  } catch (e) {
    console.log(err);
  }

  try {
    if (message == "!alistar" && canIngress) {
      if (fs.readFileSync("battle.txt", "utf8") == "true") {
        if (participants.findIndex((i) => i.player === user.username) === -1) {
          participants.push({
            player: user.username,
            life: 100,
            dead: false,
            defenseChance: -1,
            lastCommand: 1,
            savedCommand: false,
          });
          client.action(
            url,
            `${user.username} está alistado para a batalha que se aproxima!`
          );
        }
      }
    }
  } catch (e) {
    console.log(err);
  }

  try {
    if (message == "!baixas" && !canIngress) {
      if (deads.length > 0) {
        let deadPlayers = "";
        deads.forEach((dead, index) => {
          if (index == deads.length - 1) {
            deadPlayers += dead.player + ".";
          } else {
            deadPlayers += dead.player + ", ";
          }
        });
        client.action(url, `Heróis caídos: ${deadPlayers}`);
      } else {
        client.action(url, `Não há heróis caídos!`);
      }
    }
  } catch (e) {
    console.log(e);
  }

  console.log(participants.findIndex((i) => i.lastCommand === 1)) === 0;
  try {
    index = participants.findIndex((i) => i.player === user.username);
    participant = participants[index];
    if (
      message == "!atacar" &&
      !canIngress &&
      gameStarted &&
      roundPlayers &&
      !participant.dead &&
      participant.lastCommand === 1
    ) {
      damage = getRndInteger(5, 20);
      monster.life -= damage;
      data = { player: user.username, life: monster.life };
      client.action(
        url,
        `${user.username} Atacou o monstro, tirando ${damage} pontos de vida!`
      );
      socket.emit("attackPlayer", JSON.stringify(data));

      index = participants.findIndex((i) => i.player === user.username);
      participant = participants[index];

      participant.lastCommand = 0;

      if (monster.life <= 0) {
        client.action(url, `O monstro morreu!`);
        socket.emit("monsterDeath", true);
        gameStarted = false;
        gamePreStarted = false;
        participants = [];
        clearInterval(gameInterval);
      }
    }
  } catch (err) {
    console.log(err);
  }
  try {
    index = participants.findIndex((i) => i.player === user.username);
    participant = participants[index];
    if (
      message == "!defender" &&
      !canIngress &&
      gameStarted &&
      roundPlayers &&
      !participant.dead &&
      participant.lastCommand === 1
    ) {
      defenseChance = getRndInteger(25, 50);
      participant.defenseChance = defenseChance;
      participant.lastCommand = 0;
      client.action(
        url,
        `${participant.player} Você está em posição de defesa!`
      );
    }
  } catch (err) {
    console.log(err);
  }

  try {
    index = participants.findIndex((i) => i.player === user.username);
    participant = participants[index];
    if (
      message == "!salvar" &&
      !canIngress &&
      gameStarted &&
      roundPlayers &&
      !participant.dead &&
      participant.lastCommand === 1 &&
      !participant.savedCommand &&
      deads.length > 0
    ) {
      saveProbability = Math.random() < 0.1;
      if (saveProbability) {
        indexSaved = Math.floor(Math.random() * deads.length);
        var participantSaved = deads[indexSaved];

        participantSaved.dead = false;
        participantSaved.savedCommand = true;
        participantSaved.life = 50;
        participant.savedCommand = true;

        participants.push(deads.splice(indexSaved, 1));

        client.action(
          url,
          `${participant.player} salvou ${participantSaved.player}`
        );
      } else {
        client.action(
          url,
          `${participant.player} não conseguiu salvar ninguém`
        );
      }
      participant.lastCommand = 0;
    }
  } catch (err) {
    console.log(err);
  }

  if (participants.length === 0 && gameStarted) {
    gameStarted = false;
    gamePreStarted = false;
    participants = [];
    clearInterval(gameInterval);

    client.action(url, "Todos os jogadores morreram!");
    socket.emit("gameover", { gameover: true });
  }

  console.log(participants, deads);

  // test if the ingressTime has passed
  try {
    let dataString = fs.readFileSync("data.txt", "utf8");
    date = new Date(dataString);
    dateNow = new Date();
    if (dateNow - date >= ingressTime && !gameStarted && gamePreStarted) {
      gameStarted = true;
      canIngress = false;
      monster.life = participants.length * getRndInteger(35, 65);
      client.action(url, "Acabou o tempo. começando a batalha");
      socket.emit("players", JSON.stringify({ monster, participants }));
    }
  } catch (err) {}
  if (gameStarted && intervalStarted == false) {
    intervalStarted = true;
    roundPlayersExec(socket, client);
    gameInterval = setInterval(() => {
      roundPlayersExec(socket, client);
    }, roundTime);
  }
}

module.exports = battle;
