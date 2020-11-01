let bg;
let platform;

let npc = {
  name: "Punpkin Man",
  life: 1,
  aliveImg: null,
  deadImg: null,
};

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
  rect(10, 10, 180 * npc.life, 30);

  fill(255, 0, 0);
  rect(10 + 180 * npc.life, 10, 180 * (1 - npc.life), 30);

  fill(255, 255, 255);
  text(npc.name, 65, 30);

  if (npc.life > 0) {
    image(npc.aliveImg, 45, 90, 144, 190);
  } else {
    image(npc.deadImg, -25, 90, 246, 199);
  }

  image(platform, -20, height - 30, 240, 30, 0, 0, 175, 30);
}