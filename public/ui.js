console.log("UI LOADED");

const slotIcons = {
  helmet: "🪖",
  necklace: "📿",
  ring: "💍",
  gloves: "🧤",
  chest: "🛡️",
  boots: "🥾",
  weapon: "⚔️"
};



/* ===== PANEL SYSTEM ===== */

let currentPanel = null;

function closePanel(){
  const panel = document.getElementById("panel");
  panel.style.display = "none";
  currentPanel = null;
}


/* ===== SHOP SYSTEM ===== */

let shopTab = "weapons";

let shopData = {

  weapons: [
    {name:"Steel Sword", type:"weapon", damage:25, rarity:"yellow", price:200},
    {name:"War Axe", type:"weapon", damage:35, rarity:"purple", price:400}
  ],

  armor: [
    {name:"Knight Armor", type:"armor", defense:30, rarity:"yellow", price:250},
    {name:"Heavy Plate", type:"armor", defense:45, rarity:"purple", price:500}
  ],

  potions: [
    {name:"Small Potion", type:"potion", heal:0.25, rarity:"gray", price:50},
    {name:"Big Potion", type:"potion", heal:0.5, rarity:"yellow", price:150},
    {name:"Full Potion", type:"potion", heal:1, rarity:"purple", price:400}
  ],

  blackmarket: [
    {name:"Shadow Blade", type:"weapon", damage:100, rarity:"legendary", price:2000},
    {name:"Dragon Armor", type:"armor", defense:120, rarity:"legendary", price:1800}
  ]

};


/* ===== EQUIPMENT SLOTS ===== */

const equipmentSlots = {
  helmet: null,
  necklace: null,
  ring: null,
  gloves: null,
  chest: null,
  boots: null,
  weapon: null
};

const slotTypes = {
  helmet: "armor",
  necklace: "armor",
  ring: "armor",
  gloves: "armor",
  chest: "armor",
  boots: "armor",
  weapon: "weapon"
};


/* ===== RARITY COLOR + GLOW ===== */

function getRarityColor(rarity){
  return (
    rarity === "gray" ? "#555" :
    rarity === "yellow" ? "#bfa000" :
    rarity === "purple" ? "#6a1b9a" :
    rarity === "legendary" ? "#ff6f00" :
    "#222"
  );
}

function getGlow(rarity){
  return (
    rarity === "gray" ? "0 0 4px #888" :
    rarity === "yellow" ? "0 0 6px #ffd700" :
    rarity === "purple" ? "0 0 8px #b388ff" :
    rarity === "legendary" ? "0 0 10px #ff9800" :
    "none"
  );
}


/* ===== HELPERS ===== */

function getItemText(item){
  if(!item) return "-";

  let text = item.name + "<br>";

  if(item.damage) text += "DMG: " + item.damage + "<br>";
  if(item.defense) text += "DEF: " + item.defense + "<br>";

  if(item.type === "potion"){
    text += "Heal: " + Math.floor(item.heal * 100) + "%";
  }

  return text;
}


/* ===== REFRESH ===== */

function refreshEquipPanel(){
  if(currentPanel === "equip"){
    renderEquipPanel();
  }
}

function refreshShop(){
  if(currentPanel === "shop"){
    openShop();
  }
}


/* ===== EQUIP / USE ===== */

function autoEquip(i){

  let item = player.inventory[i];

  if(item.type === "potion"){
    player.hp += player.maxHp * item.heal;
    player.hp = Math.min(player.hp, player.maxHp);
    player.inventory.splice(i,1);
    refreshEquipPanel();
    return;
  }

  if(item.type === "weapon"){
    equipToSlot(i, "weapon");
    return;
  }

  equipToSlot(i, "chest");
}


function equipToSlot(i, slot){

  let item = player.inventory[i];

  if(slotTypes[slot] !== item.type) return;

  let temp = equipmentSlots[slot];

  equipmentSlots[slot] = item;

  if(temp){
    player.inventory[i] = temp;
  } else {
    player.inventory.splice(i,1);
  }

  refreshEquipPanel();
}


/* ===== UNEQUIP ===== */

function unequipItem(slot){

  let item = equipmentSlots[slot];
  if(!item) return;

  player.inventory.push(item);
  equipmentSlots[slot] = null;

  refreshEquipPanel();
}


/* ===== SLOT STYLE ===== */

function getSlotStyle(item){
  if(!item){
    return `background:#222;color:white;`;
  }

  return `
    background:${getRarityColor(item.rarity)};
    color:white;
    box-shadow:${getGlow(item.rarity)};
  `;
}


/* ===== EQUIPMENT PANEL ===== */

function renderEquipPanel(){

  const panel = document.getElementById("panel");

  panel.innerHTML = `
    <div class="close-btn" onclick="closePanel()">✖</div>
    <div class="panel-title">Equipment</div>

    <div style="display:flex; justify-content:center; margin-bottom:20px;">
  <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">

    <!-- Helmet -->
    <div class="slot" onclick="unequipItem('helmet')" style="${getSlotStyle(equipmentSlots.helmet)}">
      ${slotIcons.helmet}
    </div>

    <!-- Necklace -->
    <div class="slot" onclick="unequipItem('necklace')" style="${getSlotStyle(equipmentSlots.necklace)}">
      ${slotIcons.necklace}
    </div>

    <!-- Middle -->
    <div style="display:flex; gap:12px;">
      <div class="slot" onclick="unequipItem('ring')" style="${getSlotStyle(equipmentSlots.ring)}">
        ${slotIcons.ring}
      </div>

      <div class="slot big" onclick="unequipItem('chest')" style="${getSlotStyle(equipmentSlots.chest)}">
        ${slotIcons.chest}
      </div>

      <div class="slot" onclick="unequipItem('gloves')" style="${getSlotStyle(equipmentSlots.gloves)}">
        ${slotIcons.gloves}
      </div>
    </div>

    <!-- Boots -->
    <div class="slot" onclick="unequipItem('boots')" style="${getSlotStyle(equipmentSlots.boots)}">
      ${slotIcons.boots}
    </div>

    <!-- Weapon -->
    <div class="slot" onclick="unequipItem('weapon')" style="${getSlotStyle(equipmentSlots.weapon)}">
      ${slotIcons.weapon}
    </div>

  </div>
</div>





  </div>
</div>

    <div class="panel-title">Inventory</div>

    <div class="inventory">
      ${player.inventory.map((item,i)=>`
        <div class="inv-item"
          onclick="autoEquip(${i})"
          style="
            background:${getRarityColor(item.rarity)};
            box-shadow:${getGlow(item.rarity)};
          ">
          ${getItemText(item)}
        </div>
      `).join("")}
    </div>
  `;
}


/* ===== SHOP PANEL ===== */

function openShop(){

  const panel = document.getElementById("panel");
  panel.style.display = "block";
  currentPanel = "shop";

  panel.innerHTML = `
    <div class="close-btn" onclick="closePanel()">✖</div>

    <div class="panel-title">Blacksmith Shop</div>

    <div style="display:flex; gap:10px; margin-bottom:10px;">
      ${["weapons","armor","potions","blackmarket"].map(tab=>`
        <button onclick="changeShopTab('${tab}')"
          style="background:${shopTab===tab ? "#666" : "#333"}; color:white;">
          ${tab}
        </button>
      `).join("")}
    </div>

    <div style="display:flex; gap:20px;">

      <!-- BUY -->
      <div style="flex:1;">
        <h3>Buy</h3>

        ${shopData[shopTab].map((item,i)=>`
          <div style="
            border:1px solid white;
            margin-bottom:6px;
            padding:6px;
            background:${getRarityColor(item.rarity)};
            box-shadow:${getGlow(item.rarity)};
          ">
            ${getItemText(item)}
            Price: ${item.price}g<br>
            <button onclick="buyItem('${shopTab}',${i})">Buy</button>
          </div>
        `).join("")}

      </div>

      <!-- SELL -->
      <div style="flex:1;">
        <h3>Sell</h3>

        ${player.inventory.map((item,i)=>`
          <div style="border:1px solid white;margin-bottom:6px;padding:6px;background:#111;">
            ${item.name}<br>
            <button onclick="sellItem(${i})">Sell (${getSellPrice(item)}g)</button>
          </div>
        `).join("")}

      </div>

    </div>
  `;
}


/* ===== SHOP FUNCTIONS ===== */

function changeShopTab(tab){
  shopTab = tab;
  openShop();
}

function buyItem(category,i){
  let item = shopData[category][i];
  if(player.gold < item.price) return;

  player.gold -= item.price;
  player.inventory.push({...item});

  refreshShop();
}

function getSellPrice(item){
  if(item.rarity==="legendary") return 500;
  if(item.rarity==="purple") return 200;
  if(item.rarity==="yellow") return 100;
  return 25;
}

function sellItem(i){
  let item = player.inventory[i];
  player.gold += getSellPrice(item);
  player.inventory.splice(i,1);
  refreshShop();
}


/* ===== TOGGLE PANEL ===== */

function togglePanel(type){

  const panel = document.getElementById("panel");

  if(currentPanel === type){
    closePanel();
    return;
  }

  currentPanel = type;
  panel.style.display = "block";

  if(type === "stats"){
    panel.innerHTML = `
      <div class="close-btn" onclick="closePanel()">✖</div>
      <div class="panel-title">Character</div>

      Level: ${player.level}<br>
      XP: ${player.xp}/${player.level * 50}<br><br>

      HP: ${Math.floor(player.hp)} / ${player.maxHp}<br>
      Gold: ${player.gold}
    `;
  }

  if(type === "equip"){
    renderEquipPanel();
  }
}


/* ===== UI ===== */

function drawUI(){
  document.getElementById("ui").innerHTML = `
    HP: ${Math.floor(player.hp)}/${player.maxHp}<br>
    Gold: ${player.gold}<br>
    Inventory: ${player.inventory.length}<br>
  `;
}
