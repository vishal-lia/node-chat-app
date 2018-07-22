const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const express = require('express');

const { generateMessage, generateLocationMessage } = require('./utils/message');

const app = express();

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', socket => {
    console.log('New User connected');

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the Chat App'));

    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New User Joined'));

    socket.on('createMessage', (message, callback) => {
        console.log('Create message:', message);
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback('This is from server..');
    });

    socket.on('createLocationMessage', message => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', message.latitude, message.longitude));
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, ()=> {
    console.log('Server up on port', port);
})