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
      damage = getRndInteger(20, 40);

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
const username = "edersondeveloper";

deads = [];
var canIngress = true;
var gameStarted = false;
var startDate = undefined;
var battleStarted = false;
var intervalStarted = false;
var gamePreStarted = false;
var roundPlayers = false;
var gameInterval;
const ingressTime = 10000;
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
      battleStarted = true;
      startDate = new Date();
      client.action(
        url,
        "Digite !alistar seguido de sua classe (guerreiro, mago, clérigo)!"
      );

      gamePreStarted = true;
      socket.emit("start", true);
    }
  } catch (e) {
    console.log(err);
  }

  try {
    const aux = message.toLowerCase().split(" ");
    if (aux[0] == "!alistar" && canIngress) {
      if (battleStarted) {
        let passedAlist = true;
        if (participants.findIndex((i) => i.player === user.username) === -1) {
          switch (aux[1]) {
            case "guerreiro":
              participants.push({
                player: user.username,
                life: 100,
                dead: false,
                baseAttack: 15,
                baseDefense: 15,
                defenseChance: -1,
                lastCommand: 1,
                savedCommand: true,
                ultimate: false,
                class: "warrior",
              });
              break;
            case "mago":
              participants.push({
                player: user.username,
                life: 50,
                dead: false,
                baseAttack: 20,
                baseDefense: 5,
                defenseChance: -1,
                lastCommand: 1,
                savedCommand: false,
                ultimate: false,
                class: "wizard",
              });
              break;
            case "clerigo":
            case "clérigo":
              participants.push({
                player: user.username,
                life: 75,
                dead: false,
                baseAttack: 10,
                baseDefense: 10,
                defenseChance: -1,
                lastCommand: 1,
                savedCommand: false,
                class: "cleric",
              });
              break;
            default:
              passedAlist = false;
              client.action(
                url,
                `${user.username} Digite !alistar seguido de guerreiro, mago ou clérigo!`
              );
          }
          if (passedAlist) {
            client.action(
              url,
              `${user.username} está alistado como ${aux[1]} para a batalha que se aproxima! Use !atacar para atacar, !especial para usar o ataque especial (mago, guerreiro), !defender para se defender de um golpe, e !salvar para tentar salvar alguém morto!`
            );
          }
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
  } catch (err) {
    console.log(err);
  }

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
      switch (participant.class) {
        case "warrior":
          damage = getRndInteger(5, 10) + participant.baseAttack;
          break;
        case "wizard":
          damage = getRndInteger(10, 15) + participant.baseAttack;
          break;
        case "cleric":
          damage = getRndInteger(3, 8) + participant.baseAttack;
          break;
      }
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
      message == "!especial" &&
      !canIngress &&
      gameStarted &&
      roundPlayers &&
      !participant.dead &&
      participant.ultimate === false
    ) {
      console.log(participant.class);
      switch (participant.class) {
        case "warrior":
          damage = getRndInteger(10, 20) + participant.baseAttack;
          break;
        case "wizard":
          damage = getRndInteger(15, 30) + participant.baseAttack;
          break;
      }

      monster.life -= damage;
      data = { player: participant.player, life: monster.life };
      client.action(
        url,
        `${user.username} Usou o especial e atacou o monstro, tirando ${damage} pontos de vida!`
      );
      socket.emit("attackPlayer", JSON.stringify(data));

      if (monster.life <= 0) {
        client.action(url, `O monstro morreu!`);
        socket.emit("monsterDeath", true);
        gameStarted = false;
        gamePreStarted = false;
        participants = [];
        clearInterval(gameInterval);
      }

      participant.ultimate = true;
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
      switch (participant.class) {
        case "warrior":
          defenseChance = getRndInteger(30, 60);
          break;
        case "wizard":
          defenseChance = getRndInteger(15, 40);
          break;
        case "cleric":
          defenseChance = getRndInteger(10, 25);
          break;
      }
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
      if (participant.class === "cleric") {
        saveProbability = Math.random() < 0.4;
      } else {
        saveProbability = Math.random() < 0.1;
      }

      if (saveProbability) {
        indexSaved = Math.floor(Math.random() * deads.length);
        var participantSaved = deads[indexSaved];

        participantSaved.dead = false;

        if (participant.class != "cleric") {
          participantSaved.savedCommand = true;
        }
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

  console.log(participants);

  // test if the ingressTime has passed
  console.log(!gameStarted, canIngress);
  if (!gameStarted && canIngress) {
    setTimeout(() => {
      gameStarted = true;
      canIngress = false;
      monster.life = participants.length * getRndInteger(80, 125);
      socket.emit("players", JSON.stringify({ monster, participants }));

      if (gameStarted && intervalStarted == false) {
        client.action(url, "Acabou o tempo. começando a batalha");
        intervalStarted = true;
        roundPlayersExec(socket, client);
        gameInterval = setInterval(() => {
          roundPlayersExec(socket, client);
        }, roundTime);
      }
    }, ingressTime);
  }
}

module.exports = battle;
