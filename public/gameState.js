/* ===== GLOBAL GAME STATE ===== */

const game = {

  player: {
    x: 800,     
    y: 800,
    hp: 100,
    maxHp: 100,
    level: 1,
    xp: 0,
    gold: 0,
    speed: 3,
    weapon: null,
    armor: null,
    inventory: []
  },

  drops: [],
  monsters: [],

  currentMap: "main",

  isDead: false
};