import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use(express.static("public"));


app.get("/", (req, res) => {
	res.status(404).send("No endpoint specified");
});

app.listen(PORT,() => {
	console.log(`server running at ${process.env.BACKEND_URL}${PORT}`);
});
