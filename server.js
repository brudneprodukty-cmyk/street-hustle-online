const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* ===== SERVE YOUR GAME ===== */
app.use(express.static(path.join(__dirname, "public")));

/* ===== PLAYER STORAGE ===== */
let players = {};

/* ===== CONNECTION ===== */
io.on("connection", (socket) => {

  console.log("Player connected:", socket.id);

  players[socket.id] = {
    x: 100,
    y: 100
  };

  socket.emit("currentPlayers", players);

  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    ...players[socket.id]
  });

  socket.on("move", (data) => {
    if(players[socket.id]){
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
    }
  });

  socket.on("disconnect", () => {
    console.log("Player left:", socket.id);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });

});

/* ===== GAME LOOP ===== */
setInterval(() => {
  io.emit("updatePlayers", players);
}, 1000 / 30);

/* ===== START SERVER ===== */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
