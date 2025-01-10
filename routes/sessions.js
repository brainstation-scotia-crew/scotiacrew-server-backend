import express from "express";
const router = express.Router();
import {v4 as uuidv4} from 'uuid';
import { tokenToSocket } from "../server.js";

let customersQueue = [];
let advisorsQueue = [];

// /sessions/[whatever]
router.get("/request-token",(_req,res)=>{
	let token = uuidv4();
	res.status(200).json({"token": token});
});

router.get("/getCustomer", (_req, res)=>{
    if(customersQueue[0] !== undefined){
        
        token = customersQueue.shift();
        res.status(200).json({token: `${token}`});
    }
    else{
        res.status(404).json({error: "No customers in queue"})
    }
});

router.put("/queue-up", (req, res) => {
    const { token } = req.body;
    const { userType} = req.body;
    if (!token) {
        return res.status(400).json({ error: "Missing 'id' in request body" });
    }
    
    if(!userType){
        return res.status(400).json({error: "Missing 'userType' in body"});
    }

    switch(userType){
        case "customer":
            customersQueue.push(token);
            res.status(200).json({queue: `${customersQueue.length}`});
            break;
        case "advisor":
            advisorsQueue.push(token);
            res.status(200).json({queue: `${advisorsQueue.length}`});
            break;
        default:
            return res.status(400).json({error:"Bad 'userType'"});
    }
});


router.post("/inbox", (req, res) => {
    const {to, from, message} = req.body;

    if (!to || !from || !message) {
        return res.status(400).json({error: "Missing 'to', 'from', or 'message' fields"});
    }

    const recipientSocket = tokenToSocket.get(to);
    if (recipientSocket) {
        recipientSocket.emit("inbox-message", {from, message});
        res.status(200).json({success: true, message: "Message sent successfully"});
    } else {
        res.status(404).json({error: "Recipient not found"});
    }
});
export default router;