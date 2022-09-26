const { io } = require("socket.io-client");
const fs = require("fs");


const MAX_CLIENTS = 1000;
const CLIENT_CREATION_INTERVAL = 10; // client / s
const CLIENT_CREATION_INTERVAL_IN_MS = 1000; // s
const EMIT_INTERVAL_IN_MS = 1000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;
let socketList = [];
let count = 0


function SleepJs(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

const createClient = () => {
  // for demonstration purposes, some clients stay sctuck in HTTP long-polling
  const socket = io("ws://localhost:3333")

  setInterval(() => {
    socket.emit("client to server event");
  }, EMIT_INTERVAL_IN_MS);

  socket.on("server to client event", () => {
    packetsSinceLastReport++;
  });

  socket.on("connect", () => {
    count++
    console.log(`${count} connected`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`disconnect due to ${reason}`);
  });

  socketList.push(socket);
};

async function startScript() {
  let totalPage = Math.ceil(MAX_CLIENTS / CLIENT_CREATION_INTERVAL)
  for (let page = 0; page < totalPage; page++) {
    let start = page * CLIENT_CREATION_INTERVAL;
    let end = (page * CLIENT_CREATION_INTERVAL) + CLIENT_CREATION_INTERVAL;

    await SleepJs(CLIENT_CREATION_INTERVAL_IN_MS);

    for (let index = start; index < end; index++) {
        createClient()
      }
  }
}

startScript()

setInterval(function() {}, 5000);

const printReport = () => {
  const now = new Date().getTime();
  const durationSinceLastReport = (now - lastReport) / 1000;
  const packetsPerSeconds = (
    packetsSinceLastReport / durationSinceLastReport
  ).toFixed(2);

  console.log(
    `client count: ${clientCount} ; average packets received per second: ${packetsPerSeconds}`
  );

  packetsSinceLastReport = 0;
  lastReport = now;
};

// setInterval(printReport, 5000);

process.on("SIGINT", function () {
  console.log("ffff")

  for (let i = 0; i < socketList.length; i++) {
    try {
      socketList[i].disconnect()
    } catch (error) {
      console.log("disconnect error", error)
    }
  }
  process.exit()
})
