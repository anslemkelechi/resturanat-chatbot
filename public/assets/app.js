// Getting text boy and showing on UI
let textField = document.getElementById("text-field");
let sendBtn = document.getElementById("sendBtn");

let chatBody = document.querySelector(".chat-items");

//Socket IO Codebase
const socket = io();

let menu;
//Intercept Welcome Message
socket.on("welcome", (message) => {
  botResponse(message);
});
//HANDLE CLearing CHat

socket.on("clearChat", (message) => {
  location.reload();
});
//Intercepts Session Created Message
socket.on("session_created", (message) => {
  if (message.length > 1) {
    botResponse(message[0]);
    const d = new Date();
    d.setTime(d.getTime() + 20 * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = `jwt=${message[1]};${expires}`;
  } else {
    botResponse(message[0]);
  }
});

//Incerpts Instructions
socket.on("responseError", (message) => {
  botResponse(message);
});

//Incerpts Menu Option(Selects 1)
socket.on("menu", (message) => {
  setTimeout(() => {
    let body = `<h3 class="botmenu">${message[0]}</h3>
        `;
    chatBody.insertAdjacentHTML("beforeend", body);
  }, 500);

  //Send Menu to fromtend Scope
  menu = message[1];
  message[1].forEach((cur) => {
    setTimeout(() => {
      let body = `
                  <ul class="botmenu">
                  <h3>${message[1].indexOf(cur) + 3}:  ${cur.name}</h3>
                    <li>Price: &#x20A6;${cur.price}</li>
                    <li>Protein: ${cur.protein}</li>
                    <li>Drink: ${cur.drink}</li>
                  </ul>`;
      chatBody.insertAdjacentHTML("beforeend", body);
    }, 500);
  });
});

//Order Resposnse
//1. Select Order
socket.on("orderResponse", (message) => {
  botResponse(message);
});
//2.Checkout Order If Order Placed
socket.on("checkOut", (message) => {
  botResponse(message);
});
//3.Failed Checkout
socket.on("checkOutFailed", (message) => {
  botResponse(message);
});
//4. Order History
socket.on("orderHistory", (message) => {
  message.forEach((cur) => {
    setTimeout(() => {
      let body = `
                  <ul class="botmenu">
                  <h3>${cur.name}</h3>
                    <li>Price: &#x20A6;${cur.price}</li>
                    <li>Protein: ${cur.protein}</li>
                    <li>Drink: ${cur.drink}</li>
                  </ul>`;
      chatBody.insertAdjacentHTML("beforeend", body);
    }, 500);
  });
});
//5. Camcel Order
socket.on("orderCancelled", (message) => {
  botResponse(message);
});
//6.
socket.on("orderError", (message) => {
  botResponse(message);
});
const botResponse = (message) => {
  setTimeout(() => {
    let body = ` <div class="chat">
                           <i class="fa-brands fa-bots"></i>
                            <p>${message}</p>
                        </div>`;
    chatBody.insertAdjacentHTML("beforeend", body);
  }, 500);
};

sendBtn.addEventListener("click", (e) => {
  if (textField.value != "") {
    let text = textField.value.toLowerCase();
    let body = ` <div class="chat --user">
                           <i class="fa-solid fa-user"></i>
                            <p>${text}</p>
                        </div>`;
    chatBody.insertAdjacentHTML("beforeend", body);
    textField.value = "";
    socket.emit("userResponse", [text, 225]); //225 to indetify this as a new connection
  }
});

textField.addEventListener("keyup", (e) => {
  if (e.keyCode == 13) {
    sendBtn.click();
  }
});
