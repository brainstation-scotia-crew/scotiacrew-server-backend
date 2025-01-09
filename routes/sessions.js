import express from "express";
const router = express.Router();
import {v4 as uuidv4} from 'uuid';

let customersQueue = [];
let advisorsQueue = [];

let customersBusy = [];
let advisorsBusy = [];

// /sessions/[whatever]
router.get("/request-token",(_req,res)=>{
	let token = uuidv4();
	res.status(200).json({"token": token});
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
export default router;