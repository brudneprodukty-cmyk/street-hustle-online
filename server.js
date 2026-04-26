const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* ===== SERVE GAME ===== */
app.use(express.static(path.join(__dirname, "public")));

/* ===== PLAYER STORAGE ===== */
let players = {};

/* ===== CONNECTION ===== */
io.on("connection", (socket) => {

  console.log("Player connected:", socket.id);

  /* CREATE PLAYER */
  players[socket.id] = {
    x: 100,
    y: 100,
    dir: "down",
    moving: false,
    frame: 0
  };

  /* SEND ALL PLAYERS TO NEW PLAYER */
  socket.emit("currentPlayers", players);

  /* TELL OTHERS */
  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    ...players[socket.id]
  });

  /* ===== MOVEMENT SYNC ===== */
  socket.on("move", (data) => {

    if(!players[socket.id]) return;

    players[socket.id] = {
      x: data.x,
      y: data.y,
      dir: data.dir || "down",
      moving: data.moving || false,
      frame: data.frame || 0
    };

  });

  /* ===== DISCONNECT ===== */
  socket.on("disconnect", () => {
    console.log("Player left:", socket.id);

    delete players[socket.id];

    io.emit("playerDisconnected", socket.id);
  });

});

/* ===== GAME LOOP (SYNC ALL PLAYERS) ===== */
setInterval(() => {
  io.emit("updatePlayers", players);
}, 1000 / 30); // 30 FPS

/* ===== START SERVER ===== */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
