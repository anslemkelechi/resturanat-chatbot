const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server, { cookie: true });
const userController = require("./controllers/userResponse");

//DATABASE CONNECTION
const dotenv = require("dotenv");
const mongoose = require("mongoose");

//Uncaught Exception handler
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 🔥 Shutting Down...");
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

//CREATE DB CONNECTION
let DB = process.env.DATABASE_PROD.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

if (process.env.NODE_ENV == "development") {
  DB = process.env.DATABASE_LOCAL;
}
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB Connection Successful");
  });

//Runs when a new connection starts
io.on("connection", async (socket) => {
  try {
    console.log("New Connection");
    socket.order = [];
    const check = await userController.checkUser(socket);
    if (check[0]) {
      let tone = `Welcome ${check[1].name}, What would like to order today or do you want me to show you your previous order? To communicate effectively with me please follow the instructions below.<br> Select 1 to place order <br> Select 99 to checkout Order <br> Select 98 to view order history <br> Select 97 to view current order <br> Select 0 to cancel order`;
      socket.emit("welcome", tone);
    } else {
      let tone = `Hello and welcome, My name is Alie, I'm here to assist you with all your dining needs. Whether you're looking for a reservation, menu recommendations, have an order, or have any questions about our restaurant, I'm here to help. Simply type in your query and I'll do my best to provide you with a prompt and helpful response. 
  So, let's get started and make your dining experience a great one!, Let's start by knowing your name.`;
      socket.emit("welcome", tone);
    }
    //HANDLES USERRESPONSE
    socket.on("userResponse", async (message) => {
      if (message.includes(225)) {
        //Create New User
        const value = await userController.createUser(socket, message);
        
        //Handle Orders & wrong inputs
        if (value) {
          userController.handleOrders(socket, message, check[1]._id);
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
});

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, () => {
  console.log(`Server running on on ${PORT}`);
});
