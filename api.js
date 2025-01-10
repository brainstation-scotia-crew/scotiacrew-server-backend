import axios from "axios"
import {io} from "socket.io-client"
const apiClient = axios.create({
    baseURL: `http://localhost:8080`,
    headers:{
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response)=>{
        return response.data;
    },
    (error)=>{
        if(error.response){
            console.error('error response: ', error.response);
        }
        else{
            console.error('error message: ', error.message);
        }
        return Promise.reject(error);
    }
);

export const sendMessage = (message, to, from) =>{
    const requestBody ={
        from: from,
        to: to,
        message: message,
    }
    return apiClient.post(`/sessions/send-message`, requestBody);
}

export const getToken = () =>{
	return apiClient.get(`/sessions/request-token`);
}
export const queueUp = (token, userType) => {
	const requestBody = {
		token: token,
		userType: userType,
	}
	return apiClient.put(`/sessions/queue-up`,requestBody);
}

export const connect = (token) =>{
    const socket = io('http://localhost:8080'); 

    socket.on('connect', () => {
        console.log(`Client connected with socket ID: ${socket.id}`);
        socket.emit('register', token);
    });
    socket.on('inbox-message', (data) => {
        console.log(`Message from ${data.from}: ${data.message}`);
    });
    
}