let drops = [];

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const TILE = 32;
const MAP_W = 50;
const MAP_H = 50;

let currentMap = "main";
let canTeleport = true;
let time = 0;

let camera = {x:0,y:0};
let keys = {};