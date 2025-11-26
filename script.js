// ===== MATRIX BACKGROUND =====
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "01";
const fontSize = 14;
const columns = canvas.width / fontSize;

let drops = Array.from({ length: columns }).fill(1);

function drawMatrix() {
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#00ff9d";
  ctx.font = fontSize + "px monospace";

  drops.forEach((y, i) => {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, i * fontSize, y * fontSize);

    drops[i] = y * fontSize > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
  });
}
setInterval(drawMatrix, 40);


// ===== FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, get }
from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0R_sX_3-iHTIdR-cV6XnBkK-dCi15ny0",
  authDomain: "project-ano.firebaseapp.com",
  databaseURL: "https://project-ano-default-rtdb.firebaseio.com",
  projectId: "project-ano",
  storageBucket: "project-ano.firebasestorage.app",
  messagingSenderId: "871392286002",
  appId: "1:871392286002:web:614a92e162f4f8a42e332b",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// ===== GLOBAL =====
let isAdmin = false;
let username = null;
let avatarColor = "#" + Math.floor(Math.random()*16777215).toString(16);


// ===== LOGIN =====
document.getElementById("saveUser").onclick = () => {
  username = document.getElementById("username").value.trim();
  let pass = document.getElementById("password").value.trim();

  if (username.length < 3) {
    alert("Username too short");
    return;
  }

  localStorage.setItem("user", username);
  localStorage.setItem("pass", pass);
  localStorage.setItem("avatar", avatarColor);

  document.getElementById("loginOverlay").style.display = "none";

  updateOnlineUsers();
};


// ===== AUTO LOGIN =====
window.onload = () => {
  if (localStorage.getItem("user")) {
    username = localStorage.getItem("user");
    avatarColor = localStorage.getItem("avatar");
    document.getElementById("loginOverlay").style.display = "none";
    updateOnlineUsers();
  }
};


// ===== ADMIN LOGIN =====
document.getElementById("adminLogin").onclick = () => {
  const u = document.getElementById("adminUser").value;
  const p = document.getElementById("adminPass").value;

  if (u === "zerohex" && p === "badatom2556") {
    isAdmin = true;
    document.getElementById("secretAdminBtn").style.display = "block";
    document.getElementById("adminTag").style.display = "block";
    document.getElementById("loginOverlay").style.display = "none";
  } else {
    alert("Wrong admin credentials");
  }
};


// ===== SEND MESSAGE =====
document.getElementById("sendBtn").onclick = () => {
  const msg = document.getElementById("msgBox").value.trim();

  if (!msg) return;

  push(ref(db, "messages"), {
    user: username || "Anonymous",
    msg,
    color: avatarColor,
    time: new Date().toLocaleTimeString(),
  });

  document.getElementById("msgBox").value = "";
};


// ===== RECEIVE MESSAGE =====
onChildAdded(ref(db, "messages"), (snap) => {
  const data = snap.val();
  const id = snap.key;

  const div = document.createElement("div");
  div.classList.add("message");

  div.innerHTML = `
    <span style="color:${data.color}" class="username">${data.user}</span>:
    ${data.msg}
    <span class="time">${data.time}</span>
  `;

  const del = document.createElement("button");
  del.innerText = "Delete";
  del.classList.add("deleteBtn");

  if (isAdmin) del.style.display = "block";

  del.onclick = () => {
    remove(ref(db, "messages/" + id));
    div.remove();
  };

  div.appendChild(del);
  document.getElementById("messages").appendChild(div);

  const box = document.getElementById("messages");
  box.scrollTop = box.scrollHeight;
});


// ===== ADMIN PANEL =====
document.getElementById("secretAdminBtn").onclick = () => {
  document.getElementById("adminPanel").style.display = "block";

  get(ref(db, "messages")).then(snap => {
    document.getElementById("msgCount").innerText = snap.size;
  });
};

document.getElementById("deleteAll").onclick = () => {
  remove(ref(db, "messages"));
  document.getElementById("messages").innerHTML = "";
  alert("All messages deleted");
};

document.getElementById("closePanel").onclick = () => {
  document.getElementById("adminPanel").style.display = "none";
};


// ===== ONLINE USERS =====
function updateOnlineUsers() {
  const box = document.getElementById("onlineUsers");
  box.innerHTML = `<b>👥 Online:</b> <span style='color:${avatarColor}'>${username}</span>`;
}
