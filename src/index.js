const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./../src/utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log('Connect websocket');

  socket.on('join', ({ username, room }, callback) => {
    const user = addUser({ id: socket.id, username, room });

    if (user.error) {
      callback(user.error);
    }

    socket.join(user.room);
    socket.emit('message', generateMessage('Admin', 'Welcome to Vanisiter')); // is obj
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('Admin', `${user.username} has been joined`)
      );

    io.to(user.room).emit('onlineUsers', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    socket.join(user.room);
    const filter = new Filter();
    if (filter.isProfane()) {
      return callback('Profanity is not allow');
    }
    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.username} has been left`)
      );

      io.to(user.room).emit('onlineUsers', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
    // Dùng io thay vì socket.broadcast bởi vì một cá nhân bị disconnect không thể nào phát ra tin nhắn
  });

  socket.on('sendLocation', (position, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${position.latitude},${position.longitude}`
      )
    );
    callback();
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Connect to ${port}`);
});
