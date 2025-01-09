import express from "express";
import cors from "cors";
import "dotenv/config";
import sessions from "./routes/sessions.js";

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use((req, _res, next) => {
	console.log(`Request Method: ${req.method} | Request URL: ${req.url}`);
	next();
  });

app.get("/", (_req, res) => {
	res.status(404).send("No endpoint specified");
});

app.use("/sessions", sessions);


app.listen(PORT,() => {
	console.log(`server running at ${process.env.BACKEND_URL}${PORT}`);
});
