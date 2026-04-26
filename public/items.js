console.log("items loaded");

/* ===== RARITY ===== */
function getRarity(){
  let r = Math.random();

  if(r < 0.05) return "legendary";  // 5%
  if(r < 0.20) return "purple";     // 15%
  if(r < 0.50) return "yellow";     // 30%
  return "gray";                    // 50%
}


/* ===== ITEM GENERATOR ===== */
function createItem(){

  let rarity = getRarity();

  let baseStats = {
    gray: 5,
    yellow: 10,
    purple: 20,
    legendary: 40
  };

  /* WEAPON TYPES */
  let weapons = [
    {name:"Sword", bonus:"balanced"},
    {name:"Axe", bonus:"high damage"},
    {name:"Dagger", bonus:"fast"},
    {name:"Katana", bonus:"crit"},
    {name:"Blade", bonus:"sharp"}
  ];

  /* ARMOR TYPES */
  let armors = [
    {name:"Armor", bonus:"tank"},
    {name:"Chestplate", bonus:"defense"},
    {name:"Vest", bonus:"light"},
    {name:"Plate", bonus:"heavy"},
    {name:"Guard", bonus:"balanced"}
  ];

  let stat = baseStats[rarity] + Math.floor(Math.random()*6);

  /* CREATE WEAPON */
  if(Math.random() < 0.5){

    let w = weapons[Math.floor(Math.random()*weapons.length)];

    return {
      type: "weapon",
      name: rarity + " " + w.name,
      damage: stat,
      rarity: rarity,
      info: w.bonus   // 👈 extra flavor (doesn't break anything)
    };
  }

  /* CREATE ARMOR */
  else{

    let a = armors[Math.floor(Math.random()*armors.length)];

    return {
      type: "armor",
      name: rarity + " " + a.name,
      defense: stat,
      rarity: rarity,
      info: a.bonus   // 👈 extra flavor
    };
  }
}