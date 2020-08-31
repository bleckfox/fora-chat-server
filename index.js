const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const { response } = require('express');
const cors = require('cors');

const router = require('./router');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.port || 3030

app.use(cors());
app.use(router);


io.on('connect', (socket) => {
    socket.on('join', ( { name, room }, callback ) => {
        const { error, user } = addUser( { id: socket.id, name, room} );
        
        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('message', { user: 'server', text: `${user.name} joined to chat` });
        socket.broadcast.to(user.room).emit('message', { user: 'server', text: `${user.name} joined to chat` });

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        
        callback();
    });

    socket.on('sendMessage', ( message, callback) => {
        const user = getUser(socket.id);
        
        io.to(user.room).emit('message', { user: user.name, text: message } );
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', { user: 'server', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    });
});

server.listen(port, () => console.log(`Server has started.`));