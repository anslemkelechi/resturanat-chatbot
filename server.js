const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Runs when a new connection starts
io.on("connection", (socket) => {
  console.log("New Connection");
  //Allow user to pick bot speech tone
  let tone = `Hello and welcome, My name is Alie, I'm here to assist you with all your dining needs. Whether you're looking for a reservation, menu recommendations, have an order, or have any questions about our restaurant, I'm here to help. Simply type in your query and I'll do my best to provide you with a prompt and helpful response. 
  So, let's get started and make your dining experience a great one!, Let's start by knowing your name.`;
  socket.emit("welcome", tone);
  socket.on("userResponse", (message) => {
    //Set variable for botone
    if (tone.includes(message)) {
      socket.request.tone = tone.indexOf(message);
    } else {
      console.log("Not here");
    }
  });
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, () => {
  console.log(`Server running on on ${PORT}`);
});
