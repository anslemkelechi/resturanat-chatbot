const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  orders: {
    type: [Object],
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
