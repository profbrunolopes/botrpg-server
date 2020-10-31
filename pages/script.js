var socket = io();

socket.on('players', (msg) => {
  console.log(msg);
});

socket.on('round', (msg) => {
  console.log(msg);
});

socket.on('attackPlayer', (msg) => {
  console.log(msg);
});

socket.on('attackMonster', (msg) => {
  console.log(msg);
});
