let monsterLife = 100
let gameover = false;

let bg;
let platform;

let npc = {
  name: "Pumpkin Man",
  life: 100,
  aliveImg: null,
  deadImg: null,
};


var socket = io();

socket.on("players", (msg) => {
  let game = JSON.parse(msg)
  monsterLife = game.monster.life
});

socket.on("round", (msg) => {
  console.log(msg);
});

socket.on("attackPlayer", (msg) => {
  let attack = JSON.parse(msg)
  npc.life = attack.life;
  console.log(attack.life)
});

socket.on("attackMonster", (msg) => {
  console.log(msg);
});

socket.on("gameover", (msg) => {
  console.log(msg)
});

function preload() {
  bg = loadImage("./public/img/bg.png");
  platform = loadImage("./public/img/platform.png");
  npc.aliveImg = loadImage("./public/img/npc-idle.png");
  npc.deadImg = loadImage("./public/img/npc-dead.png");
}

function setup() {
  createCanvas(200, 300);
}

function draw() {
  background(152);

  image(bg, 0, 0, 200, 300, 0, 0, 500, 500);

  fill(0, 153, 0);
  rect(10, 10, 180 * npc.life/monsterLife, 30);

  fill(255, 0, 0);
  rect(10 + 180 * npc.life/monsterLife, 10, 180 * (1 - npc.life/monsterLife), 30);

  fill(255, 255, 255);
  textSize(12)
  text(npc.name, 65, 30);

  if(npc.life <= 0){

    fill(0, 0, 0);
    rect(25, 50, 150,30);

    fill(255, 255, 255);
    textSize(20);
    text('Game Over!', 50, 70);

  }
  

  if (npc.life > 0) {
    image(npc.aliveImg, 45, 90, 144, 190);
  } else {
    image(npc.deadImg, -25, 90, 246, 199);
  }

  image(platform, -20, height - 30, 240, 30, 0, 0, 175, 30);
}
