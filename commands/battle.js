function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function roundPlayersExec(socket, client) {
  if (roundPlayers === false) {
    socket.emit('round', 'players');
    client.action(url, 'Round dos jogadores');

    participants.forEach((element) => {
      if (element.dead === false) {
        client.action(url, `${element.player} Sua vez de atacar!`);
      }
    });

    roundPlayers = true;
  } else {
    socket.emit('round', 'monster');
    client.action(url, 'Round do monstro');

    for (i = 0; i < participants.length; i++) {
      element = participants[i];

      damage = getRndInteger(10, 30);
      element.life -= damage;

      if (element.life < 0){
        element.life = 0
      }

      client.action(
        url,
        `O monstro tirou ${damage} pontos de vida de ${element.player} e sobrou ${element.life} pontos de vida`,
      );
      if (element.life <= 0 && participants[i].dead === false) {
        client.action(url, `${element.player} morreu!`);

        socket.emit('playerDeath', element.player);
        participants[i].dead = true;
        deads.push(participants[i]);
      }
    }

    roundPlayers = false;
  }
}

const fs = require('fs');

const username = 'profbrunolopes';

deads = [];
var canIngress = true;
var gameStarted = false;
var intervalStarted = false;
var gamePreStarted = false;
var roundPlayers = false;
var gameInterval;
const ingressTime = 40000;
const roundTime = 31000;

participants = [];


const monster = { 
  id: 1,
  life: 0
}

function battle(message, user, client, socket) {
  const streamer = url.replace('#', '');
  if (message == '!batalha' && user.username == username) {
    fs.writeFileSync('battle.txt', 'true');
    fs.writeFileSync('data.txt', `${new Date()}`);
    client.action(url, 'Digite !alistar para se alistar!');

    gamePreStarted = true;
    socket.emit('start', true);
  }
  if (message == '!alistar' && canIngress === true) {
    if (fs.readFileSync('battle.txt', 'utf8') == 'true') {
      if (participants.findIndex((i) => i.player === user.username) === -1) {
        participants.push({ player: user.username, life: 100, dead: false });
      }
    }
  }

  try {
    if (
      message == '!atacar' &&
      canIngress === false &&
      gameStarted &&
      roundPlayers &&
      participants.findIndex((i) => i.player === user.username) != -1 &&
      participants.findIndex((i) => i.player === user.username && i.dead) === -1
    ) {
      damage = getRndInteger(5, 20);
      monster.life -= damage;
      data = { player: user.username, life: monster.life };
      client.action(
        url,
        `${user.username} Atacou o monstro, tirando ${damage} pontos de vida!`,
      );
      socket.emit('attackPlayer', JSON.stringify(data));
      if (monster.life <= 0) {
        client.action(url, `O monstro morreu!`);
        socket.emit('monsterDeath', true);
        gameStarted = false;
        gamePreStarted = false;
        clearInterval(gameInterval);
      }
    }
  } catch (err) {
    console.log(err);
  }

  if (deads.length === participants.length && gameStarted) {
    gameStarted = false;
    gamePreStarted = false;
    clearInterval(gameInterval);
    
    client.action(url, 'Todos os jogadores morreram!')
    socket.emit('gameover', {gameover:true})
  }

  console.log(participants);

  // test if the ingressTime has passed
  try {
    let dataString = fs.readFileSync('data.txt', 'utf8');
    date = new Date(dataString);
    dateNow = new Date();
    if (
      dateNow - date >= ingressTime &&
      gameStarted === false &&
      gamePreStarted
    ) {
      gameStarted = true;
      canIngress = false;
      monster.life = participants.length * getRndInteger(35, 65);
      client.action(url, 'Acabou o tempo. começando a batalha');
      socket.emit('players', JSON.stringify({monster,participants}));
    }
  } catch (err) {}
  if (gameStarted === true && intervalStarted == false) {
    intervalStarted = true;
    roundPlayersExec(socket, client);
    gameInterval = setInterval(() => {
      roundPlayersExec(socket, client);
    }, roundTime);
  }
}

module.exports = battle;
