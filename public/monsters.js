let monsters = [];

function spawnMonster(){
monsters.push({
x: Math.random()*MAP_W*TILE,
y: Math.random()*MAP_H*TILE,
hp: 30
});
}

for(let i=0;i<8;i++) spawnMonster();

let dmg = player.weapon ? player.weapon.damage : 10;

monsters.forEach((m,i)=>{
let dist = Math.hypot(player.x-m.x, player.y-m.y);

if(dist < 40){
m.hp -= dmg;

if(m.hp <= 0){
player.gold += 10;

if(quest.active && !quest.completed){
quest.kills++;
if(quest.kills >= quest.goal){
quest.completed = true;

player.inventory.push({
type:"weapon",
name:"Quest Sword",
damage:25,
rarity:"yellow"
});
}
}

drops.push({
x:m.x,
y:m.y,
item:createItem()
});

monsters.splice(i,1);
spawnMonster();
}
}
});