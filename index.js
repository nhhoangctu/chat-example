const app = require('express')();
const express = require('express');
const path = require('path');

const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3333;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log("connected")
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
