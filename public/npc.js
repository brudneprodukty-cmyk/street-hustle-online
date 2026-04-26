let shopItems = [
  {name:"Legendary Sword", type:"weapon", damage:80, rarity:"legendary", price:1000},
  {name:"Legendary Axe", type:"weapon", damage:90, rarity:"legendary", price:1200},
  {name:"Legendary Armor", type:"armor", defense:70, rarity:"legendary", price:900}
];


/* ===== NPC POSITIONS ===== */

let npc = { x: 9*TILE, y: 12*TILE };        // Wizard
let knight = { x: 11*TILE, y: 12*TILE };    // Armory
let healer = { x: 13*TILE, y: 12*TILE };    // Healer


/* ===== QUEST SYSTEM ===== */

let quest = {
  active:false,
  completed:false,
  kills:0,
  goal:3
};


/* ===== PANEL CONTROL ===== */

function closePanel(){
  const panel = document.getElementById("panel");
  panel.style.display = "none";
  currentPanel = null;
}


/* ===== WIZARD (QUEST NPC) ===== */

function interactNPC(){

  let dist = Math.hypot(player.x - npc.x, player.y - npc.y);

  if(dist < 60){
    let panel = document.getElementById("panel");
    panel.style.display = "block";

    if(!quest.active && !quest.completed){

      panel.innerHTML = `
        <div class="close-btn" onclick="closePanel()">✖</div>

        <div class="panel-title">Ancient Wizard</div>

        <div>
          I sense potential in you...<br>
          But you are not yet worthy.<br><br>

          Slay <b>3 monsters</b> and return.
        </div>

        <button class="panel-btn" onclick="startQuest()">Accept Quest</button>
      `;
    }

    else if(quest.active && !quest.completed){

      panel.innerHTML = `
        <div class="close-btn" onclick="closePanel()">✖</div>

        <div class="panel-title">Ancient Wizard</div>

        <div>
          Progress: <b>${quest.kills}/${quest.goal}</b><br><br>
          Finish the task.
        </div>
      `;
    }

    else{

      panel.innerHTML = `
        <div class="close-btn" onclick="closePanel()">✖</div>

        <div class="panel-title">Ancient Wizard</div>

        <div>
          You have done well.<br><br>
          Take your reward.
        </div>
      `;
    }
  }
}

function startQuest(){
  quest.active = true;
  closePanel();
}


/* ===== KNIGHT (ARMORY NPC) ===== */

function interactKnight(){

  let dist = Math.hypot(player.x - knight.x, player.y - knight.y);

  if(dist < 60){
    openShop();
  }
}


/* ===== HEALER NPC ===== */

function interactHealer(){

  let dist = Math.hypot(player.x - healer.x, player.y - healer.y);

  if(dist < 60){

    let panel = document.getElementById("panel");
    panel.style.display = "block";

    panel.innerHTML = `
      <div class="close-btn" onclick="closePanel()">✖</div>

      <div class="panel-title">Healer</div>

      <div>
        You look wounded...<br><br>
        Choose your option:
      </div>

      <button class="panel-btn" onclick="fullHeal()">
        Full Heal (5 gold)
      </button>

      <button class="panel-btn" onclick="openPotionShop()">
        Buy Potions
      </button>
    `;
  }
}


/* ===== HEAL FUNCTIONS ===== */

function fullHeal(){

  if(player.gold >= 5){
    player.gold -= 5;
    player.hp = player.maxHp;
  }

  closePanel();
}


/* ===== POTION SHOP ===== */

function openPotionShop(){

  let panel = document.getElementById("panel");

  panel.innerHTML = `
    <div class="close-btn" onclick="closePanel()">✖</div>

    <div class="panel-title">Potions</div>

    <button class="panel-btn" onclick="buyPotion(0.25,10)">
      Small Potion (25%) - 10 gold
    </button>

    <button class="panel-btn" onclick="buyPotion(0.5,500)">
      Medium Potion (50%) - 500 gold
    </button>

    <button class="panel-btn" onclick="buyPotion(1,1000)">
      Full Potion (100%) - 1000 gold
    </button>
  `;
}


/* ===== BUY POTION ===== */

function buyPotion(percent, cost){

  if(player.gold >= cost){

    player.gold -= cost;

    player.inventory.push({
      type:"potion",
      heal: percent,
      name: Math.floor(percent*100) + "% Potion"
    });
  }
}