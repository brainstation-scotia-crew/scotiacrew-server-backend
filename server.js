import express from "express";
import cors from "cors";
import "dotenv/config";
import sessions from "./routes/sessions.js";
import http from "http";
import { Server } from "socket.io";
import { customerAdvisorMap } from "./routes/sessions.js";

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
io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("register", (token) => {
        tokenToSocket.set(token, socket);
        console.log(`Token ${token} -> Socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
        let disconnectedToken = null;
      
        for (const [key, value] of tokenToSocket.entries()) {
            if (value === socket) {
                tokenToSocket.delete(key);
                disconnectedToken = key;
                console.log(`Deleted token ${key} for socket ${socket.id}`);
                break;
            }
        }

        if (disconnectedToken) {
            const counterpartToken = customerAdvisorMap.get(disconnectedToken);

            if (counterpartToken) {
                customerAdvisorMap.delete(disconnectedToken);
                customerAdvisorMap.delete(counterpartToken);

                const counterpartSocket = tokenToSocket.get(counterpartToken);
                if (counterpartSocket) {
                    counterpartSocket.emit("counterpart-disconnected", {
                        message: "Your counterpart has disconnected.",
                    });
                }

                console.log(`Cleaned up mapping for ${disconnectedToken} and ${counterpartToken}`);
            }
        }
    });
});

server.listen(PORT,() => {
	console.log(`server running at ${process.env.BACKEND_URL}${PORT}`);
});

export {tokenToSocket};