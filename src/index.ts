import express from "express";
import * as http from 'http';
import dotenv from "dotenv";
import WebSocket from "ws";
import {initDatabase} from "./database";
import {handleWS} from "./websocket";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

initDatabase();

wss.on("connection", handleWS);

const port = process.env.PORT || 6969;
server.listen(port, () => {
    console.log(`Server running at port http://localhost:${port}`)
});
