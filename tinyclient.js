import { io } from 'socket.io-client';

const socket = io('http://localhost:8080'); 

const token = 'cbec68c9-a029-4565-97c5-871558acfebe';

socket.on('connect', () => {
    console.log(`Client connected with socket ID: ${socket.id}`);
    socket.emit('register', token);
});

socket.on('inbox-message', (data) => {
    console.log(`Message from ${data.from}: ${data.message}`);
});
