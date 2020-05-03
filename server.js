var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let users = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('new-user', function (data, callback) {
    if(data in users){
      callback(false);
    }else{
      callback(true);
      socket.nickname = data;
      users[socket.nickname] = socket;
      io.sockets.emit('usernames', Object.keys(users));
    }
  });

  socket.on('send-message', (data) =>{
    let message = data.msg.trim();
    let receiver = data.target;
    if(receiver.substr(0,6) === 'Global'){
      socket.broadcast.emit('new-message', {msg: message, nickname: socket.nickname});
    }else{
      if(receiver in users){
        users[receiver].emit('priv-message', {msg: message, nickname: socket.nickname})
      }
    }
  });

  socket.on('disconnect', (data) => {
    if(!socket.nickname) return;
    delete users[socket.nickname];
    io.sockets.emit('usernames', Object.keys(users));
  })
});

http.listen(9000, () => {
  console.log('listening on *:9000');
});
