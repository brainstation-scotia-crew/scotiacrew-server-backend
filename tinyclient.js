import axios from 'axios';
import { io } from 'socket.io-client';
import readlineSync from 'readline-sync';

// Setup API client for interacting with the server
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      console.error('Error response: ', error.response);
    } else {
      console.error('Error message: ', error.message);
    }
    return Promise.reject(error);
  }
);

let token = '';

// Function to get a new token from the server
const getToken = async () => {
  const response = await apiClient.get('/sessions/request-token');
  return response.token;
};

// Function to queue up as an advisor
const queueUpAsAdvisor = async () => {
  const response = await apiClient.put('/sessions/queue-up', {
    token,
    userType: 'advisor',
  });
  console.log(`You are queued as an advisor. Queue position: ${response.queue}`);
};

// Function to get a customer from the server
const getCustomer = async () => {
  const response = await apiClient.get('/sessions/getCustomer');
  return response.token;
};

// Function to send a message to the customer
const sendMessage = (message) => {
  const requestBody = {
    from: token,
    message,
  };
  return apiClient.post('/sessions/send-message', requestBody);
};

// Create socket connection to the server
const connectSocket = () => {
  const socket = io('http://localhost:8080');

  socket.on('connect', () => {
    console.log(`Connected to server with socket ID: ${socket.id}`);
    socket.emit('register', token);
  });

  socket.on('inbox-message', (data) => {
    console.log(`Message from customer: ${data.message}`);
  });

  return socket;
};

// Main function to handle the terminal interaction
const runClient = async () => {
  token = await getToken();
  console.log(`Your token: ${token}`);

  await queueUpAsAdvisor();

  // Wait for a customer to connect
  const customerToken = await getCustomer();
  console.log(`A customer has connected with token: ${customerToken}`);

  const socket = connectSocket();

  // Message loop
  while (true) {
    const message = readlineSync.question('Enter a message to send to the customer (or type "exit" to quit): ');
    if (message.toLowerCase() === 'exit') {
      console.log('Exiting...');
      socket.disconnect();
      break;
    }
    await sendMessage(message);
    console.log(`Message sent to customer: ${message}`);
  }
};

// Start the client
runClient();