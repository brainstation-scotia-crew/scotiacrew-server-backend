import express from "express";
const router = express.Router();
import {v4 as uuidv4} from 'uuid';
import { tokenToSocket } from "../server.js";

let customersQueue = [];
let advisorsQueue = [];
let customerAdvisorMap = new Map();
export  {customerAdvisorMap};

// /sessions/[whatever]
router.get("/request-token",(_req,res)=>{
	let token = uuidv4();
	res.status(200).json({"token": token});
});


router.get("/debug", (_req, res) => {
    res.json({
        map: Array.from(customerAdvisorMap.entries()),
        customersQueue: Array.from(customersQueue),     
        advisorsQueue: Array.from(advisorsQueue)        
    });
});
router.get("/getCustomer", (_req, res) => {
    if (customersQueue.length > 0) {
        const customerToken = customersQueue.shift();
        const advisorToken = advisorsQueue.shift();

        if (advisorToken) {
            // Storing both customer and advisor tokens with roles
            customerAdvisorMap.set(customerToken, { token: advisorToken, role: 'advisor' });
            customerAdvisorMap.set(advisorToken, { token: customerToken, role: 'customer' });
            res.status(200).json({ token: `${customerToken}` });
        } else {
            res.status(404).json({ error: "No advisors available" });
        }
    } else {
        res.status(404).json({ error: "No customers in queue" });
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

// {
// 	"from": "824167b9-e27b-42df-a190-c1798949e414",
// 	"message": "test"
// }
router.post("/send-message", (req, res) => {
    const { from, message } = req.body;

    if (!from || !message) {
        return res.status(400).json({ error: "Missing 'from' or 'message' fields" });
    }

    const { token: toToken, role } = customerAdvisorMap.get(from) || {};

    if (!toToken) {
        return res.status(404).json({ error: "No connection found for the sender" });
    }

    // Use the token and role to find the recipient's socket
    const recipientSocket = tokenToSocket.get(toToken);

    if (recipientSocket) {
        recipientSocket.emit("inbox-message", { from, message, role });
        res.status(200).json({ success: true, message: "Message sent successfully" });
    } else {
        res.status(404).json({ error: "Recipient not connected" });
    }
});
export default router;