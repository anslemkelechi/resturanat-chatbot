const Order = require("./../models/order");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.jwt_secret, {
    expiresIn: process.env.jwt_expires,
  });
};

//Inital Value for token
let JWtoken;
//Intial Array for user reponses we permit
let messageCode = [1, 97, 98, 99, 0, 9, 8, 7, 6, 5, 4, 3, 00];

//Create JWT Token.
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
  try {
    //Check If user exists previously
    let JWT = cookieParser.parse(socket.handshake.headers.cookie).jwt || "";
    if (!JWT || JWT == "") {
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
  } catch (err) {
    console.log(err);
  }
};
exports.createUser = async (socket, message) => {
  try {
    //Check If user exists previously add to session flow.
    const JWT = cookieParser.parse(socket.handshake.headers.cookie).jwt;
    JWtoken =
      cookieParser.parse(socket.handshake.headers.cookie).jwt || JWtoken;
    if (!JWT && JWtoken === undefined) {
      messageCode.push(message[0]);
      console.log(messageCode);
      const newOrder = await Order.create({ name: message[0] });
      const token = createToken(newOrder);
      socket.emit("session_created", [
        `Welcome ${message[0]}, What would like to order today? To communicate effectively with me please follow the instructions below.<br> Select 1 to place order <br> Select 99 to checkout Order <br> Select 98 to view order history <br> Select 97 to view current order <br> Select 0 to cancel order`,
        token,
      ]);
      JWtoken = token;
    }
    return true;
  } catch (err) {
    console.log(err);
  }
};

exports.handleOrders = (socket, message, id) => {
  let menuArray = [
    "To select an order, type the number besides the food.",
    [
      {
        name: "Jollof Rice",
        protein: "3 Chicken Chests, One Beef",
        drink: "1 Pepsi or equivalent",
        price: 10000,
      },
      {
        name: "Local Stew",
        protein: "2 Chicken Chests, One Ponmo",
        drink: "1 Pepsi or equivalent",
        price: 5000,
      },
      {
        name: "Egusi Soup",
        protein: "One Pack Assorted Beef",
        drink: "1 Maltina or equivalent",
        price: 10000,
      },
      {
        name: "Pepper Soup",
        protein: "One Full Catfish",
        drink: "1 Star-Ragla",
        price: 9000,
      },
      {
        name: "Moi-Moi",
        protein: "One Boiled Egg",
        drink: "1 Pepsi or equivalent",
        price: 7000,
      },
      {
        name: "Suya",
        protein: "40 Pieces Of Grilled Meat",
        drink: "1 Smirnoff Ice or equivalent",
        price: 10000,
      },
      {
        name: "Fried Rice",
        protein: "3 Chicken Chests, One Ponmo",
        drink: "1 Pepsi or equivalent",
        price: 15000,
      },
    ],
  ];
  if (messageCode.includes(Number(message[0]))) {
    if (message[0] == 100) {
      socket.emit("clearChat", true);
    }

    if (message[0] == 1) {
      socket.emit("menu", menuArray);
    }

    //Handle selecting orders
    if (
      message[0] == 3 ||
      message[0] == 4 ||
      message[0] == 5 ||
      message[0] == 6 ||
      message[0] == 7 ||
      message[0] == 8 ||
      message[0] == 9
    ) {
      socket.emit(
        "orderResponse",
        "Order Recieved, Proceed to checkout by typing 99"
      );
      const index = Number(message[0]) - 3;
      socket.order.push(menuArray[1][index]);
      const createOrder = async () => {
        try {
          const order = await Order.findByIdAndUpdate(
            id,
            { $push: { orders: menuArray[1][index] } },
            {
              new: true,
              runValidators: false,
            }
          );
        } catch (err) {
          console.log(err);
        }
      };

      createOrder();
    }
    if (message[0] == 99) {
      if (socket.order.length >= 1) {
        const total = socket.order.reduce((num, curVal) => {
          return num + curVal.price;
        }, 0);
        socket.emit(
          "checkOut",
          `Order succesfully placed 😊,  Total Price &#x20A6;${total} You can place another order!`
        );
      } else {
        socket.emit(
          "checkOutFailed",
          "Ooo 😔, There is no order to place, Please place an order before you checkout"
        );
      }
      socket.emit("menu", menuArray);
    }

    if (message[0] == 98) {
      const findOrder = async () => {
        try {
          const user = await Order.findById(id).select("-_id");
          const orders = user.orders;
          socket.emit("orderHistory", orders);
        } catch (err) {
          console.log(err);
        }
      };
      findOrder();
    }

    if (message[0] == 97) {
      if (socket.order.length >= 1) {
        const order = socket.order;
        socket.emit("orderHistory", order);
      }
    }

    if (message[0] == 0) {
      if (socket.order.length >= 1) {
        socket.order.splice(0, socket.order.length);
        socket.emit(
          "orderCancelled",
          "😥, your order is cancelled, You can make another order"
        );
        socket.emit("menu", menuArray);
      } else {
        socket.emit("orderError", "You don't have a current order");
      }
    }
  } else {
    console.log(message);
    socket.emit(
      "responseError",
      "Huh 😕, I can't seem to understand what you mean, To communicate effectively with me please follow the instructions below.<br> Select 1 to place order <br> Select 99 to checkout Order <br> Select 98 to view order history <br> Select 97 to view current order <br> Select 0 to cancel order"
    );
  }

  return;
};
