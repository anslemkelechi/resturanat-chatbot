const Order = require("./../models/order");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.jwt_secret, {
    expiresIn: process.env.jwt_expires,
  });
};

const createToken = (order) => {
  const token = signToken(order._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.jwt_cookie_expires * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  return token;
};

exports.checkUser = async (socket) => {
  //Check If user exists previously
  const JWT = cookieParser.parse(socket.handshake.headers.cookie).jwt;
  if (!JWT) {
    return [false, "No User"];
  } else {
    const decoded = await promisify(jwt.verify)(JWT, process.env.jwt_secret);
    //Check if user exists
    const currentUser = await Order.findById(decoded.id);
    if (!currentUser) {
      return [false, "No User"];
    } else {
      return [true, currentUser];
    }
  }
};
exports.createUser = async (socket, message) => {
  //Check If user exists previously
  const JWT = cookieParser.parse(socket.handshake.headers.cookie).jwt;
  if (!JWT) {   
    const newOrder = await Order.create({ name: message[0] });
    const token = createToken(newOrder);
    socket.emit("session_created", [
      `Welcome ${message[0]}, What would like to order today? To communicate effectively with me please follow the instructions below.`,
      token,
    ]);
  }
  return;
};

exports.handleOrders = async (socket) => {
  const options = [
    "Select 1 to place an order",
    "Select 98 to checkout Order",
    "Select 98 to view order history",
    "Select 97 to view current order",
    "Select 0 to cancel order",
  ];
  await socket.emit("instructions", options);
};
