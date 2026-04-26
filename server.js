const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* ===== SERVE YOUR GAME ===== */
app.use(express.static("public"));

/* ===== PLAYER STORAGE ===== */
let players = {};

/* ===== CONNECTION ===== */
io.on("connection", (socket) => {

  console.log("Player connected:", socket.id);

  // create player
  players[socket.id] = {
    x: 100,
    y: 100
  };

  // send all players to new player
  socket.emit("currentPlayers", players);

  // tell others about new player
  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    ...players[socket.id]
  });

  /* ===== MOVEMENT ===== */
  socket.on("move", (data) => {
    if(players[socket.id]){
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
    }
  });

  /* ===== DISCONNECT ===== */
  socket.on("disconnect", () => {
    console.log("Player left:", socket.id);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });

});

/* ===== GAME LOOP (SYNC) ===== */
setInterval(() => {
  io.emit("updatePlayers", players);
}, 1000 / 30); // 30 FPS

/* ===== START SERVER ===== */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});