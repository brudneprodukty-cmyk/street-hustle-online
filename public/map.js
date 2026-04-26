/* ===== MAP ===== */

let map = [];

/* GENERATE MAP */
for(let y=0;y<MAP_H;y++){
  map[y]=[];
  for(let x=0;x<MAP_W;x++){

    let tile = 0;

    // cross road
    if(y===25 || x===25) tile = 1;

    // house zone
    if(x>=5 && x<=12 && y>=5 && y<=10) tile = 2;

    map[y][x]=tile;
  }
}


/* ===== CAMERA ===== */

function updateCamera(){
  camera.x = player.x - canvas.width/2;
  camera.y = player.y - canvas.height/2;
}


/* ===== DRAW MAP ===== */

function drawMap(){

  /* ===== GRASS ===== */
  ctx.fillStyle="#2e7d32";
  ctx.fillRect(-camera.x,-camera.y,MAP_W*TILE,MAP_H*TILE);


  /* ===== TILES ===== */
  for(let y=0;y<MAP_H;y++){
    for(let x=0;x<MAP_W;x++){

      let tile = map[y][x];
      let drawX = x*TILE - camera.x;
      let drawY = y*TILE - camera.y;

      if(tile===1){
        ctx.fillStyle="#bfa76f";
        ctx.fillRect(drawX,drawY,TILE,TILE);
      }

      if(tile===2){
        ctx.fillStyle="#6d4c41";
        ctx.fillRect(drawX,drawY,TILE,TILE);
      }
    }
  }


/* ===== FOREST BORDER (IMPROVED) ===== */

for(let x = -2; x < MAP_W + 2; x++){
  for(let y = -2; y < MAP_H + 2; y++){

    if(x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) continue;

    let drawX = x * TILE - camera.x;
    let drawY = y * TILE - camera.y;

    // 🌳 slight randomness so trees aren't identical
    let offset = Math.sin((x * 13 + y * 7)) * 2;

    // 🌲 TRUNK
    ctx.fillStyle = "#4e342e";
    ctx.fillRect(drawX + 13, drawY + 18, 6, 10);

    // 🌿 LOWER LEAVES
    ctx.fillStyle = "#1b5e20";
    ctx.beginPath();
    ctx.moveTo(drawX + 16, drawY + 4 + offset);
    ctx.lineTo(drawX + 4, drawY + 20);
    ctx.lineTo(drawX + 28, drawY + 20);
    ctx.closePath();
    ctx.fill();

    // 🌿 MIDDLE LAYER
    ctx.fillStyle = "#2e7d32";
    ctx.beginPath();
    ctx.moveTo(drawX + 16, drawY + 8 + offset);
    ctx.lineTo(drawX + 6, drawY + 20);
    ctx.lineTo(drawX + 26, drawY + 20);
    ctx.closePath();
    ctx.fill();

    // 🌿 TOP LAYER
    ctx.fillStyle = "#66bb6a";
    ctx.beginPath();
    ctx.moveTo(drawX + 16, drawY + 12 + offset);
    ctx.lineTo(drawX + 8, drawY + 20);
    ctx.lineTo(drawX + 24, drawY + 20);
    ctx.closePath();
    ctx.fill();

    // 🌑 SHADOW (depth)
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(drawX + 16, drawY + 28, 10, 4, 0, 0, Math.PI*2);
    ctx.fill();
  }
}



  /* ===== HOUSE ===== */

  let hx = 5*TILE - camera.x;
  let hy = 6*TILE - camera.y;

  ctx.fillStyle = "#5d4037";
  ctx.fillRect(hx, hy, 7*TILE, 4*TILE);

  ctx.fillStyle = "#3e2723";
  ctx.fillRect(hx + 3*TILE, hy + 2*TILE, TILE, TILE*2);

  ctx.fillStyle = "#90caf9";
  ctx.fillRect(hx + TILE, hy + TILE, TILE, TILE);
  ctx.fillRect(hx + 5*TILE, hy + TILE, TILE, TILE);

  ctx.fillStyle = "#8d6e63";
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx + 3.5*TILE, hy - 2*TILE);
  ctx.lineTo(hx + 7*TILE, hy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(hx, hy, 7*TILE, 6);


  /* ===== FLOWERS ===== */
  for(let i=0;i<8;i++){
    ctx.fillStyle = i%2===0 ? "#e91e63" : "#ffeb3b";
    ctx.fillRect(hx - 10 + i*20, hy + 4*TILE + 4, 4, 4);
  }

  /* ===== BUSHES ===== */
  ctx.fillStyle = "#2e7d32";
  ctx.beginPath();
  ctx.arc(hx - 10, hy + 3*TILE, 8, 0, Math.PI*2);
  ctx.arc(hx + 7*TILE + 10, hy + 3*TILE, 8, 0, Math.PI*2);
  ctx.fill();


  /* ===== NPC SHADOWS ===== */
  ctx.fillStyle = "rgba(0,0,0,0.3)";

  ctx.beginPath();
  ctx.ellipse(npc.x - camera.x + 10, npc.y - camera.y + 20, 10, 5, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(knight.x - camera.x + 10, knight.y - camera.y + 20, 10, 5, 0, 0, Math.PI*2);
  ctx.fill();


  /* ===== WIZARD ===== */
  let wx = npc.x - camera.x;
  let wy = npc.y - camera.y;

  ctx.fillStyle = "#5e35b1";
  ctx.fillRect(wx+4, wy+12, 12, 10);

  ctx.fillStyle = "#66bb6a";
  ctx.fillRect(wx+3, wy+2, 14, 12);


  /* ===== QUEST TEXT ===== */
  let alpha = (Math.sin(time) + 1) / 2;
  let floatY = Math.sin(time * 2) * 5;

  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 14px Arial";

  if(!quest.completed){
    ctx.fillText(
      "QUEST",
      npc.x - camera.x - 10,
      npc.y - camera.y - 10 + floatY
    );
  }

  ctx.globalAlpha = 1;


  /* ===== KNIGHT ===== */
  let kx = knight.x - camera.x;
  let ky = knight.y - camera.y;

  ctx.fillStyle="#9e9e9e";
  ctx.fillRect(kx+4, ky+10, 12, 12);

  ctx.fillStyle="#cfd8dc";
  ctx.fillRect(kx+4, ky, 12, 10);

  ctx.fillStyle="black";
  ctx.fillRect(kx+6, ky+4, 8, 2);


/* ===== HEALER NPC ===== */
let hx2 = healer.x - camera.x;
let hy2 = healer.y - camera.y;

/* shadow (optional but looks better) */
ctx.fillStyle = "rgba(0,0,0,0.3)";
ctx.beginPath();
ctx.ellipse(hx2+10, hy2+20, 10, 5, 0, 0, Math.PI*2);
ctx.fill();

/* body (green robe) */
ctx.fillStyle="#81c784";
ctx.fillRect(hx2+4, hy2+10, 12, 12);

/* head */
ctx.fillStyle="#ffe0b2";
ctx.fillRect(hx2+4, hy2, 12, 10);

/* red cross (so people KNOW it's healer) */
ctx.fillStyle="red";
ctx.fillRect(hx2+8, hy2+4, 4, 2);
ctx.fillRect(hx2+9, hy2+3, 2, 4);


  /* ===== PORTAL (NEW) ===== */

  let px = 48*TILE - camera.x;
  let py = 25*TILE - camera.y;

  let glow = (Math.sin(time*2)+1)/2;

  ctx.shadowColor = "red";
  ctx.shadowBlur = 20 + glow*20;

  // outer ring
  ctx.beginPath();
  ctx.arc(px+16, py+16, 20, 0, Math.PI*2);
  ctx.fillStyle = "rgba(255,0,0,0.6)";
  ctx.fill();

  // inner swirl
  ctx.beginPath();
  ctx.arc(px+16, py+16, 12, 0, Math.PI*2);
  ctx.fillStyle = "rgba(0,100,255,0.7)";
  ctx.fill();

  // core
  ctx.beginPath();
  ctx.arc(px+16, py+16, 6, 0, Math.PI*2);
  ctx.fillStyle = "white";
  ctx.fill();

  ctx.shadowBlur = 0;



  /* ===== TELEPORT ===== */
  if(
    player.x > 47*TILE &&
    player.x < 49*TILE &&
    player.y > 24*TILE &&
    player.y < 27*TILE &&
    canTeleport
  ){
    currentMap="monsters";

    player.x=100;
    player.y=100;

    monsters=[];
    for(let i=0;i<10;i++) spawnMonster();

    canTeleport=false;
    setTimeout(()=>canTeleport=true,500);
  }
}


function drawYeratiMap(){

  /* SAME STYLE AS MONSTER MAP BUT DARKER */
  ctx.fillStyle="#0d3b1e";
  ctx.fillRect(-camera.x,-camera.y,MAP_W*TILE,MAP_H*TILE);

  /* RETURN PORTAL */
  ctx.fillStyle = "red";
  ctx.fillRect(25*TILE - camera.x, 25*TILE - camera.y, 60, 60);

}


/* ===== MONSTER MAP ===== */

function drawMonsterMap(){

  ctx.fillStyle="#1b5e20";
  ctx.fillRect(-camera.x,-camera.y,MAP_W*TILE,MAP_H*TILE);

let px = 20*TILE - camera.x;
let py = 45*TILE - camera.y;

let glow = (Math.sin(time*2)+1)/2;

ctx.shadowColor = "purple";
ctx.shadowBlur = 20 + glow*20;

// outer
ctx.beginPath();
ctx.arc(px+30, py+30, 25, 0, Math.PI*2);
ctx.fillStyle = "rgba(128,0,255,0.6)";
ctx.fill();

// inner
ctx.beginPath();
ctx.arc(px+30, py+30, 15, 0, Math.PI*2);
ctx.fillStyle = "rgba(0,0,0,0.7)";
ctx.fill();

ctx.shadowBlur = 0;

/* ===== PERFECT CIRCLE HITBOX ===== */
let portalX = 20*TILE;
let portalY = 45*TILE;

let dist = Math.hypot(player.x - portalX, player.y - portalY);

if(dist < 30 && canTeleport){
  currentMap = "yerati";

  player.x = 5*TILE;
  player.y = 5*TILE;

  monsters = [];
  for(let i=0;i<15;i++) spawnMonster("yerati");

  canTeleport=false;
  setTimeout(()=>canTeleport=true,500);
}


/* ===== PURPLE PORTAL TELEPORT (MATCHES CIRCLE) ===== */
if(
  player.x > 19*TILE &&
  player.x < 21*TILE &&
  player.y > 19*TILE &&
  player.y < 21*TILE &&
  canTeleport
){
  currentMap = "yerati";

  player.x = 5*TILE;
  player.y = 5*TILE;

  monsters = [];
  for(let i=0;i<15;i++) spawnMonster("yerati");

  canTeleport=false;
  setTimeout(()=>canTeleport=true,500);
}

  ctx.fillStyle="blue";
  ctx.fillRect(2*TILE-camera.x,2*TILE-camera.y,32,32);

  

  if(
    player.x > 2*TILE &&
    player.x < 3*TILE &&
    player.y > 2*TILE &&
    player.y < 3*TILE &&
    canTeleport
  ){
    currentMap="main";
    player.x=25*TILE;
    player.y=25*TILE;

    canTeleport=false;
    setTimeout(()=>canTeleport=true,500);
  }

  ctx.fillStyle="red";
  monsters.forEach(m=>{
    ctx.fillRect(m.x-camera.x,m.y-camera.y,20,20);
  });
}