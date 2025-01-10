import { io } from 'socket.io-client';

const socket = io('http://localhost:8080'); 

const token = 'd4c54793-c059-48d9-9fc7-5c3c5a529eec';

socket.on('connect', () => {
    console.log(`Client connected with socket ID: ${socket.id}`);
    socket.emit('register', token);
});

socket.on('inbox-message', (data) => {
    console.log(`Message from ${data.from}: ${data.message}`);
});