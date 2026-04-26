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

  /* TELL OTHERS ABOUT NEW PLAYER */
  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    ...players[socket.id]
  });

  /* ===== MOVEMENT + STATE ===== */
  socket.on("move", (data) => {
    if(players[socket.id]){
      players[socket.id] = {
        ...players[socket.id],
        x: data.x,
        y: data.y,
        dir: data.dir,
        moving: data.moving,
        frame: data.frame
      };
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
}, 1000 / 30);

/* ===== START SERVER ===== */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
