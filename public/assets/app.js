// Getting text boy and showing on UI
let textField = document.getElementById("text-field");
let sendBtn = document.getElementById("sendBtn");

let chatBody = document.querySelector(".chat-items");

//Socket IO Codebase
const socket = io();

//Intercept Welcome Message
socket.on("welcome", (message) => {
  botResponse(message);
});

//Intercepts Session Created Message
socket.on("session_created", (message) => {
  if (message.length > 1) {
    botResponse(message[0]);
    console.log(message[1]);
    const d = new Date();
    d.setTime(d.getTime() + 20 * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = `jwt=${message[1]};${expires}`;
  } else {
    botResponse(message[0]);
  }
});

//Incerpts Instructions
socket.on("instructions", (message) => {
  message.forEach((cur) => {
    botResponse(cur);
  });
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
