// Getting text boy and showing on UI
let textField = document.getElementById("text-field");
let sendBtn = document.getElementById("sendBtn");

let chatBody = document.querySelector(".chat-items");

//Socket IO Codebase
const socket = io();
socket.on("welcome", (message) => {
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
    socket.emit("userResponse", text);
  }
});

textField.addEventListener("keyup", (e) => {
  if (e.keyCode == 13) {
    sendBtn.click();
  }
});
