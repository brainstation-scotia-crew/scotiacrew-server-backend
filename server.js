import express from "express";
import cors from "cors";
import "dotenv/config";
import sessions from "./routes/sessions.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/*
this is hilariously insecure but i have no clue what im doing
steps:
	request-token
	then connect using socket-io-client
	then queue-up
*/


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.use((req, _res, next) => {
	console.log(`Request Method: ${req.method} | Request URL: ${req.url}`);
	next();
  });

app.get("/", (_req, res) => {
	res.status(404).send("No endpoint specified");
});

app.use("/sessions", sessions);

const tokenToSocket = new Map();
io.on("connection", (socket)=>{
	console.log(`client connected: ${socket.id}`);

	socket.on("register", (token) =>{
		tokenToSocket.set(token,socket);
		console.log(`Token ${token} -> socket ${socket.id}`);
	});

	socket.on("disconnect", () =>{
		for(const [key,value] of tokenToSocket.entries()){
			if(value === socket){
				tokenToSocket.delete(key);
				console.log(`Deleted ${key} for ${socket}`);
			}
		}
	});
});

server.listen(PORT,() => {
	console.log(`server running at ${process.env.BACKEND_URL}${PORT}`);
});

export {tokenToSocket};