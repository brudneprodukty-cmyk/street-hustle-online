
let playerHitCooldown = 0;

/* ===== INPUT ===== */

document.addEventListener("keydown",(e)=>{
let k=e.key.toLowerCase();
keys[k]=true;

if(k==="r") togglePanel("stats");
if(k==="q") togglePanel("equip");
if(k==="1"){
  useSkill();
}

/* SPACE ATTACK */
if(k===" "){
  attack();
}
});

document.addEventListener("keyup",(e)=>{
keys[e.key.toLowerCase()]=false;
});


/* ===== MULTIPLAYER ===== */
const socket = io();

let otherPlayers = {};
let myId = null;

let lastSend = 0;

/* RECEIVE ALL PLAYERS */
socket.on("currentPlayers", (players) => {
  otherPlayers = { ...players };
});

/* NEW PLAYER JOINED */
socket.on("newPlayer", (data) => {
  otherPlayers[data.id] = data;
});

socket.on("updatePlayers", (players) => {
  for(let id in players){

    if(!otherPlayers[id]){
      otherPlayers[id] = players[id];
      continue;
    }

    // set target position (VERY IMPORTANT)
    let newData = players[id];

otherPlayers[id].tx = newData.x;
otherPlayers[id].ty = newData.y;

otherPlayers[id].dir = newData.dir;
otherPlayers[id].moving = newData.moving;
otherPlayers[id].frame = newData.frame;

// only copy safe data
otherPlayers[id].dir = newData.dir;
otherPlayers[id].moving = newData.moving;
otherPlayers[id].frame = newData.frame;
  }
});

/* PLAYER LEFT */
socket.on("playerDisconnected", (id) => {
  delete otherPlayers[id];
});

/* GET YOUR ID */
socket.on("connect", () => {
  myId = socket.id;
});


/* ===== PLAYER XP ===== */

if(player.xp === undefined) player.xp = 0;
if(player.level === undefined) player.level = 1;

function gainXP(amount){
  player.xp += amount;

  if(player.xp >= player.level * 50){
    player.xp = 0;
    player.level++;
    player.maxHp += 20;
    player.hp = player.maxHp;
  }
}


/* ===== SKILL SYSTEM ===== */

let skillCooldown = 0;

function useSkill(){

  if(isDead) return;

  /* LOCKED */
  if(player.level < 3) return;

  /* COOLDOWN */
  if(skillCooldown > 0) return;

  skillCooldown = 120; // ~2 seconds cooldown (60fps)

  let dmg = (player.weapon ? player.weapon.damage : 10) * 2;

  /* AOE DAMAGE */
  monsters.forEach((m,i)=>{
    let dist = Math.hypot(player.x - m.x, player.y - m.y);

    if(dist < 100){

      m.hp -= dmg;
m.aggressive = true;

/* ===== KNOCKBACK ===== */
let dx = m.x - player.x;
let dy = m.y - player.y;
let kbDist = Math.hypot(dx, dy) || 1;

let force = 40; // you can tweak this

m.x += (dx / kbDist) * force;
m.y += (dy / kbDist) * force;
m.kbTimer = 20; // 🔥 0.3 sec stun after hit

      if(m.hp <= 0){
        player.gold += 10 + m.lvl * 5;
        gainXP(10 * m.lvl);
        kills++;

        if(Math.random() < 0.7){
          drops.push({
            x:m.x,
            y:m.y,
            item:createItem()
          });
        }

        monsters.splice(i,1);
        spawnMonster(currentMap);
      }
    }
  });
}


function saveGame(){
  const saveData = {
    player,
    inventory: player.inventory,
    equipment: equipmentSlots,
    currentMap,
    kills
  };

  localStorage.setItem("save", JSON.stringify(saveData));
}

function loadGame(){
  const save = JSON.parse(localStorage.getItem("save"));

  if(!save) return;

  // restore player
  Object.assign(player, save.player);

  // restore inventory
  player.inventory = save.inventory || [];

  // restore equipment
  for(let key in equipmentSlots){
    equipmentSlots[key] = save.equipment?.[key] || null;
  }

  // restore map + kills
  currentMap = save.currentMap || "main";
  kills = save.kills || 0;
}

/***** ===== DEATH SYSTEM ===== *****/

let isDead = false;
let respawnTimer = 0;
let respawnEndTime = 0;

const SPAWN = { x: 25*TILE, y: 25*TILE };

function getRespawnTime(){
  let lvl = player.level;

  if(lvl < 10) return 25;
  if(lvl < 20) return 90;
  if(lvl < 50) return 180;
  return 300;
}

function die(){
  if(isDead) return;

  isDead = true;

  let seconds = getRespawnTime();
  respawnTimer = seconds;
  respawnEndTime = Date.now() + seconds * 1000;
}

function updateDeath(){

  if(!isDead) return;

  let remaining = Math.max(0, Math.ceil((respawnEndTime - Date.now()) / 1000));
  respawnTimer = remaining;

  if(remaining <= 0){
    respawn();
  }
}

function respawn(){

  isDead = false;

  player.hp = player.maxHp;

  currentMap = "main";
  player.x = SPAWN.x;
  player.y = SPAWN.y;
}


/* ===== MONSTER SYSTEM ===== */

let kills = 0;
let killGoal = 150;
let boss = null;

function spawnMonster(mapType){

  let lvl;

  if(mapType === "yerati"){
    lvl = Math.floor(Math.random()*41) + 10;
  } else {
    lvl = Math.floor(Math.random()*5) + 1;
  }

monsters.push({
  x: Math.random()*MAP_W*TILE,
  y: Math.random()*MAP_H*TILE,

  hp: 20 + lvl*15,
  lvl,

  aggressive: true,
  type: mapType === "yerati" ? "zombie" : "normal",

  kbTimer: 0, // 🔥 THIS IS REQUIRED
  attackTimer: 0 
});
}


/* ===== ATTACK FUNCTION ===== */

function attack(){

  if(isDead) return;
if(currentMap !== "monsters" && currentMap !== "yerati") return;

  let dmg = player.weapon ? player.weapon.damage : 10;

  /* ===== BOSS ===== */
  if(boss){
    let dist = Math.hypot(player.x-boss.x, player.y-boss.y);

    if(dist < 60){
      boss.hp -= dmg;

      if(boss.hp <= 0){
        player.gold += 200;

        for(let i=0;i<5;i++){
          drops.push({
            x: boss.x,
            y: boss.y,
            item:createItem()
          });
        }

        boss = null;
        kills = 0;
      }
      return;
    }
  }

  /* ===== MONSTERS ===== */
  monsters.forEach((m,i)=>{
    let dist = Math.hypot(player.x-m.x, player.y-m.y);

    if(dist < 40){

      m.hp -= dmg;
m.aggressive = true;

/* ===== KNOCKBACK ===== */
let dx = m.x - player.x;
let dy = m.y - player.y;
let dist2 = Math.hypot(dx, dy) || 1;

let force = 40;

m.x += (dx / dist2) * force;
m.y += (dy / dist2) * force;
m.kbTimer = 15; // 🔥 ADD THIS


      if(m.hp <= 0){

        player.gold += 10 + m.lvl * 5;
        gainXP(10 * m.lvl);
        kills++;

        if(Math.random() < 0.7){
          drops.push({
            x:m.x,
            y:m.y,
            item:createItem()
          });
        }

        monsters.splice(i,1);
        spawnMonster(currentMap);
      }
    }
  });
}


/* ===== CLICK ===== */

document.addEventListener("click",(e)=>{

  let rect = canvas.getBoundingClientRect();
  let mouseX = e.clientX - rect.left + camera.x;
  let mouseY = e.clientY - rect.top + camera.y;

  /* ===== NPC INTERACTION (KEEP THIS) ===== */
  if(currentMap === "main"){

    if(Math.hypot(mouseX-npc.x, mouseY-npc.y) < 40){
      interactNPC();
      return;
    }

    if(Math.hypot(mouseX-knight.x, mouseY-knight.y) < 40){
      interactKnight();
      return;
    }

    if(Math.hypot(mouseX-healer.x, mouseY-healer.y) < 40){
      interactHealer();
      return;
    }
  }

  /* ===== ATTACK ONLY IF CLICKING ENEMY ===== */
  if(currentMap === "monsters" || currentMap === "yerati"){

    monsters.forEach(m=>{
      let dist = Math.hypot(mouseX - m.x, mouseY - m.y);

      if(dist < 40){
        attack();
      }
    });

    if(boss){
      let dist = Math.hypot(mouseX - boss.x, mouseY - boss.y);
      if(dist < 80){
        attack();
      }
    }
  }

});


/* ===== MONSTER AI ===== */

function updateMonsters(){

if((currentMap !== "monsters" && currentMap !== "yerati") || isDead) return;

  monsters.forEach(m=>{

    if(m.kbTimer > 0) m.kbTimer--;

    if(m.attackTimer > 0) m.attackTimer--; // ✅ MOVE IT HERE

    let dx = player.x - m.x;
    let dy = player.y - m.y;
    let dist = Math.hypot(dx,dy);

    /* DAMAGE PLAYER */
    if(dist < 40 && !isDead){

 if(m.attackTimer <= 0 && playerHitCooldown <= 0){

  let dmg = 2 + m.lvl * 1.5;

  if(m.type === "zombie"){
    dmg *= 1.5;
  }

  player.hp -= dmg;

  // ✅ CLAMP + DIE
  if(player.hp <= 0){
    player.hp = 0;
    die();
  }
  playerHitCooldown = 30; // ~0.5 sec invincible
  m.attackTimer = 60;
}
}

    /* FOLLOW */
    if(m.aggressive && dist < 200 && m.kbTimer <= 0){
      m.x += dx/dist * (0.5 + m.lvl*0.1);
      m.y += dy/dist * (0.5 + m.lvl*0.1);
    }
  });
}


/* ===== BOSS ===== */

function updateBoss(){

  if(currentMap !== "monsters") return;

  /* ===== SPAWN BOSS ===== */
  if(kills >= killGoal && !boss){
    boss = {
      x: MAP_W*TILE/2,
      y: MAP_H*TILE/2,

      hp: 1000,
      maxHp: 1200,

      size: 60,

      jumpCooldown: 0,
      attackCooldown: 0
    };
  }

  /* ===== STOP IF NO BOSS YET ===== */
  if(!boss) return;

  let dx = player.x - boss.x;
  let dy = player.y - boss.y;
  let dist = Math.hypot(dx, dy);

  /* ===== JUMP ===== */
  if(boss.jumpCooldown <= 0){

    let jumpDist = 120;

    boss.x += (dx/dist) * jumpDist;
    boss.y += (dy/dist) * jumpDist;

    boss.jumpCooldown = 60;

  } else {
    boss.jumpCooldown--;
  }

  /* ===== DAMAGE ===== */
  if(dist < 70){

    if(boss.attackCooldown <= 0){

      player.hp -= 40;

      if(player.hp <= 0){
        player.hp = 0;
        die();
      }

      boss.attackCooldown = 60;

    } else {
      boss.attackCooldown--;
    }
  }
}


/* ===== DRAW ===== */

function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(currentMap==="main") drawMap();
  if(currentMap==="monsters") drawMonsterMap();
  if(currentMap==="yerati") drawYeratiMap();

  /* DROPS */
  drops.forEach(d=>{
    ctx.fillStyle={
      gray:"white",
      yellow:"yellow",
      purple:"purple",
      legendary:"orange"
    }[d.item.rarity];

    ctx.fillRect(d.x-camera.x,d.y-camera.y,10,10);
  });

 /* MONSTERS */
if(currentMap==="monsters" || currentMap==="yerati"){
  monsters.forEach(m=>{

    let x = m.x - camera.x;
    let y = m.y - camera.y;

    /* BOUNCE */
    let bob = Math.sin(time * 4 + m.lvl) * 2;

    /* SIZE BASED ON LEVEL */
    let size = 16 + m.lvl * 2;

    /* COLOR BY LEVEL */
    let color =
      m.lvl <= 2 ? "#ff5252" :
      m.lvl <= 4 ? "#ff9800" :
      "#9c27b0";

    /* BODY */
    ctx.fillStyle = color;
    ctx.fillRect(x, y + bob, size, size);

    /* EYES */
    ctx.fillStyle = "black";

    if(m.lvl >= 4){
      ctx.fillRect(x+4, y+4 + bob, 2,2);
      ctx.fillRect(x+size-6, y+4 + bob, 2,2);
    } else {
      ctx.fillRect(x+3, y+4 + bob, 3,3);
      ctx.fillRect(x+size-6, y+4 + bob, 3,3);
    }

    /* MOUTH */
    ctx.fillRect(x+4, y+size-6 + bob, size-8, 2);

    /* LEVEL TEXT */
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.fillText("Lv"+m.lvl, x, y - 2);

    /* STRONG MONSTER GLOW */
    if(m.lvl >= 4){
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.shadowBlur = 0;
    }

  });
}

  /* ===== BOSS ===== */
if(currentMap==="monsters" && boss){

  let x = boss.x - camera.x;
  let y = boss.y - camera.y;
  let s = boss.size;

  /* ===== HP BAR ===== */

let barWidth = 60;
let barHeight = 6;

let hpPercent = boss.hp / boss.maxHp;

/* BACKGROUND */
ctx.fillStyle = "#111";
ctx.fillRect(x, y - 15, barWidth, barHeight);

/* HP */
ctx.fillStyle = "red";
ctx.fillRect(x, y - 15, barWidth * hpPercent, barHeight);

/* BORDER */
ctx.strokeStyle = "white";
ctx.strokeRect(x, y - 15, barWidth, barHeight);


ctx.fillStyle = "white";
ctx.font = "10px Arial";
ctx.fillText(Math.floor(boss.hp) + " HP", x, y - 20);


  /* BODY */
  ctx.fillStyle = "#4a148c";
  ctx.fillRect(x, y, s, s);

  /* HEAD */
  ctx.fillStyle = "#6a1b9a";
  ctx.fillRect(x+10, y-10, 40, 30);

  /* EYES */
  ctx.fillStyle = "red";
  for(let i=0;i<4;i++){
    ctx.fillRect(x+12 + i*8, y, 4,4);
  }

  /* LEGS (SPIDER STYLE) */
  ctx.strokeStyle = "#2e003e";
  ctx.lineWidth = 4;

  for(let i=0;i<4;i++){

    /* LEFT SIDE */
    ctx.beginPath();
    ctx.moveTo(x, y+10+i*10);
    ctx.lineTo(x-20, y+5+i*10);
    ctx.stroke();

    /* RIGHT SIDE */
    ctx.beginPath();
    ctx.moveTo(x+s, y+10+i*10);
    ctx.lineTo(x+s+20, y+5+i*10);
    ctx.stroke();
  }

  /* GLOW */
  ctx.shadowColor = "purple";
  ctx.shadowBlur = 15;
  ctx.shadowBlur = 0;
}

  /* PLAYER */
  ctx.fillStyle="cyan";
  drawPlayer();

  if(currentMap==="monsters"){
    drawTopBar();
  }

 
/* ===== DRAW OTHER PLAYERS ===== */
for(let id in otherPlayers){

  let p = otherPlayers[id];

  if(!p) continue;
  if(id === myId) continue;

  // smooth movement (lerp)
  if(p.tx !== undefined){
    p.x += (p.tx - p.x) * 0.1;
    p.y += (p.ty - p.y) * 0.1;
  }

  drawOtherPlayer(p);
}


  /* ===== DEATH SCREEN ===== */
  if(isDead){

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("YOU DIED", canvas.width/2 - 80, canvas.height/2 - 20);

    ctx.font = "18px Arial";
    ctx.fillText(
      "Respawning in: " + respawnTimer + "s",
      canvas.width/2 - 90,
      canvas.height/2 + 20
    );
  }
}


/* ===== TOP BAR ===== */

function drawTopBar(){

  let width = 300;
  let x = canvas.width/2 - width/2;

  let progress = Math.min(kills / killGoal, 1);

  ctx.fillStyle="#111";
  ctx.fillRect(x,20,width,20);

  ctx.fillStyle="red";
  ctx.fillRect(x,20,width*progress,20);

  ctx.strokeStyle="white";
  ctx.strokeRect(x,20,width,20);

  ctx.fillStyle="white";
  ctx.font="12px Arial";
  ctx.fillText(`Boss: ${kills}/${killGoal}`, x+80,35);
}


function pickup(){
  for(let i = drops.length - 1; i >= 0; i--){

    let d = drops[i];
    let dist = Math.hypot(player.x - d.x, player.y - d.y);

    if(dist < 25){
      player.inventory.push(d.item);
      drops.splice(i,1);
    }
  }
}


function drawPlayer(){

  let x = player.x - camera.x;
  let y = player.y - camera.y;

  let bob = Math.sin(player.frame * 6) * 2;

  /* ===== BIGGER BODY ===== */
  ctx.fillStyle = "#0097a7"; // darker cyan
  ctx.fillRect(x+3, y+8 + bob, 14, 14);

  /* ===== HEAD ===== */
  ctx.fillStyle = "#4dd0e1";
  ctx.fillRect(x+4, y + bob, 12, 10);

  /* ===== AGGRESSIVE EYES ===== */
  ctx.fillStyle = "black";

  if(player.dir === "right"){
    ctx.fillRect(x+12, y+3 + bob, 2,2);
    ctx.fillRect(x+12, y+5 + bob, 2,1); // angled
  }
  else if(player.dir === "left"){
    ctx.fillRect(x+6, y+3 + bob, 2,2);
    ctx.fillRect(x+6, y+5 + bob, 2,1);
  }
  else{
    ctx.fillRect(x+7, y+3 + bob, 2,2);
    ctx.fillRect(x+11, y+3 + bob, 2,2);
  }

  /* ===== ANGRY EYEBROWS ===== */
  ctx.fillRect(x+6, y+2 + bob, 3,1);
  ctx.fillRect(x+11, y+2 + bob, 3,1);

  /* ===== FEET (STRONGER STEP) ===== */
  ctx.fillStyle = "#01579b";

  if(player.moving){
    let step = Math.floor(player.frame % 2);

    if(step === 0){
      ctx.fillRect(x+4, y+22, 5,4);
      ctx.fillRect(x+11, y+24, 5,4);
    }else{
      ctx.fillRect(x+4, y+24, 5,4);
      ctx.fillRect(x+11, y+22, 5,4);
    }
  }else{
    ctx.fillRect(x+4, y+24, 5,4);
    ctx.fillRect(x+11, y+24, 5,4);
  }

  /* ===== WEAPON (BIGGER + CLEANER) ===== */
 /* ===== WEAPON IN HAND ===== */
if(equipmentSlots.weapon){

  let w = equipmentSlots.weapon;

  /* COLOR BASED ON RARITY */
  ctx.fillStyle = getRarityColor(w.rarity);

  if(player.dir === "right"){
    ctx.fillRect(x+17, y+12, 6,2);   // blade
    ctx.fillRect(x+15, y+12, 2,2);   // handle
  }

  else if(player.dir === "left"){
    ctx.fillRect(x-3, y+12, 6,2);
    ctx.fillRect(x+3, y+12, 2,2);
  }

  else if(player.dir === "up"){
    ctx.fillRect(x+9, y-4, 2,6);
    ctx.fillRect(x+9, y+2, 2,2);
  }

  else if(player.dir === "down"){
    ctx.fillRect(x+9, y+20, 2,6);
    ctx.fillRect(x+9, y+18, 2,2);
  }

  /* SUBTLE GLOW */
  ctx.shadowColor = getRarityColor(w.rarity);
  ctx.shadowBlur = 6;

  /* RESET SHADOW */
  ctx.shadowBlur = 0;
}

}


function drawOtherPlayer(p){

  let x = p.x - camera.x;
  let y = p.y - camera.y;

  let bob = Math.sin((p.frame || 0) * 6) * 2;

  /* BODY */
  ctx.fillStyle = "#0097a7";
  ctx.fillRect(x+3, y+8 + bob, 14, 14);

  /* HEAD */
  ctx.fillStyle = "#4dd0e1";
  ctx.fillRect(x+4, y + bob, 12, 10);

  /* EYES (DIRECTION BASED) */
  ctx.fillStyle = "black";

  if(p.dir === "right"){
    ctx.fillRect(x+12, y+3 + bob, 2,2);
    ctx.fillRect(x+12, y+5 + bob, 2,1);
  }
  else if(p.dir === "left"){
    ctx.fillRect(x+6, y+3 + bob, 2,2);
    ctx.fillRect(x+6, y+5 + bob, 2,1);
  }
  else{
    ctx.fillRect(x+7, y+3 + bob, 2,2);
    ctx.fillRect(x+11, y+3 + bob, 2,2);
  }

  /* FEET ANIMATION */
  ctx.fillStyle = "#01579b";

  if(p.moving){
    let step = Math.floor((p.frame || 0) % 2);

    if(step === 0){
      ctx.fillRect(x+4, y+22, 5,4);
      ctx.fillRect(x+11, y+24, 5,4);
    } else {
      ctx.fillRect(x+4, y+24, 5,4);
      ctx.fillRect(x+11, y+22, 5,4);
    }
  } else {
    ctx.fillRect(x+4, y+24, 5,4);
    ctx.fillRect(x+11, y+24, 5,4);
  }
}



/* ===== LOOP ===== */

function loop(){
  time += 0.05;

  /* PLAYER ANIMATION */
  if(player.moving){
    player.frame += 0.1;
  }else{
    player.frame = 0;
  }

  if(playerHitCooldown > 0) playerHitCooldown--;
  if(skillCooldown > 0) skillCooldown--;

  if(!isDead){
    move();
    updateCamera();
    pickup();
    updateMonsters();
    updateBoss();
    /* SEND POSITION TO SERVER */
let now = Date.now();

if(now - lastSend > 50){ // 20 times/sec
  socket.emit("move", {
    x: player.x,
    y: player.y,
    dir: player.dir,
    moving: player.moving,
    frame: player.frame
  });
  lastSend = now;
}

    /* ===== MONSTERS → YERATI ===== */
    if(currentMap === "monsters"){

      if(
        player.x > 25*TILE &&
        player.x < 26*TILE &&
        player.y > 45*TILE &&
        player.y < 46*TILE &&
        canTeleport
      ){
        currentMap = "yerati";

        player.x = 5*TILE;
        player.y = 5*TILE;

        /* SPAWN ZOMBIES */
        monsters = [];
        for(let i=0;i<15;i++) spawnMonster("yerati");

        canTeleport = false;
        setTimeout(()=>canTeleport=true,500);
      }
    }

    /* ===== YERATI → MONSTERS ===== */
    if(currentMap === "yerati"){

      if(
        player.x > 25*TILE &&
        player.x < 26*TILE &&
        player.y > 25*TILE &&
        player.y < 26*TILE &&
        canTeleport
      ){
        currentMap = "monsters";

        player.x = 5*TILE;
        player.y = 5*TILE;

        /* SPAWN NORMAL MONSTERS */
        monsters = [];
        for(let i=0;i<10;i++) spawnMonster("monsters");

        canTeleport = false;
        setTimeout(()=>canTeleport=true,500);
      }
    }
  }

  updateDeath();

  draw();
  drawUI();

  requestAnimationFrame(loop);
}

setInterval(saveGame, 3000);

function drawMonsters(){

  monsters.forEach(m=>{

    let x = m.x - camera.x;
    let y = m.y - camera.y;

    /* BOUNCE ANIMATION */
    let bob = Math.sin(time * 4 + m.lvl) * 2;

    /* SIZE BASED ON LEVEL */
    let size = 16 + m.lvl * 2;

    /* COLOR BASED ON LEVEL */
    let color =
      m.lvl <= 2 ? "#ff5252" :       // weak
      m.lvl <= 4 ? "#ff9800" :       // medium
      "#9c27b0";                     // strong

    /* BODY */
    ctx.fillStyle = color;
    ctx.fillRect(x, y + bob, size, size);

    /* EYES (AGGRESSIVE) */
    ctx.fillStyle = "black";

    if(m.lvl >= 4){
      // stronger monsters = smaller eyes (angrier)
      ctx.fillRect(x+4, y+4 + bob, 2,2);
      ctx.fillRect(x+size-6, y+4 + bob, 2,2);
    } else {
      ctx.fillRect(x+3, y+4 + bob, 3,3);
      ctx.fillRect(x+size-6, y+4 + bob, 3,3);
    }

    /* MOUTH */
    ctx.fillRect(x+4, y+size-6 + bob, size-8, 2);

    /* LEVEL TEXT */
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.fillText("Lv"+m.lvl, x, y - 2);

    /* ELITE GLOW */
    if(m.lvl >= 4){
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.shadowBlur = 0;
    }

  });
}


loadGame();
loop();
