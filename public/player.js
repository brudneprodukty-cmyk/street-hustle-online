/* ===== PLAYER ===== */

let player = {
  x: 25 * TILE,
  y: 25 * TILE,
  size: 20,
  speed: 1,

  hp: 100,
  maxHp: 100,

  level: 1,
  xp: 0,
  gold: 0,

  weapon: null,
  armor: null,

  inventory: [],

  /* ===== NEW (ANIMATION) ===== */
  dir: "down",
  frame: 0,
  moving: false
};


/* ===== COLLISION SYSTEM ===== */

function isColliding(x, y, size){

  /* ===== HOUSE COLLISION ===== */
let houseX = 5 * TILE;
let houseY = 6 * TILE;
let houseW = 7 * TILE;
let houseH = 4 * TILE;

/* SHRINK HITBOX */
let padding = 10;

if(
  x < houseX + houseW - padding &&
  x + size > houseX + padding &&
  y < houseY + houseH - padding &&
  y + size > houseY + padding
){
  return true;
}

  /* ===== NPC COLLISION ===== */
  let npcRadius = 20;

  if(Math.hypot(x - npc.x, y - npc.y) < npcRadius) return true;
  if(Math.hypot(x - knight.x, y - knight.y) < npcRadius) return true;

  return false;
}


/* ===== MOVEMENT ===== */

function move(){

  let newX = player.x;
  let newY = player.y;

  player.moving = false; // reset each frame

  /* ===== INPUT ===== */
  if(keys["w"]){
    newY -= player.speed;
    player.dir = "up";
    player.moving = true;
  }

  if(keys["s"]){
    newY += player.speed;
    player.dir = "down";
    player.moving = true;
  }

  if(keys["a"]){
    newX -= player.speed;
    player.dir = "left";
    player.moving = true;
  }

  if(keys["d"]){
    newX += player.speed;
    player.dir = "right";
    player.moving = true;
  }

  /* ===== APPLY COLLISION (X axis) ===== */
  if(!isColliding(newX, player.y, player.size)){
    player.x = newX;
  }

  /* ===== APPLY COLLISION (Y axis) ===== */
  if(!isColliding(player.x, newY, player.size)){
    player.y = newY;
  }

  /* ===== MAP BOUNDS ===== */
  player.x = Math.max(0, Math.min(MAP_W * TILE, player.x));
  player.y = Math.max(0, Math.min(MAP_H * TILE, player.y));
}
