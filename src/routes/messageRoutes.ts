import * as db from "../database";
import express from "express";

const messageRouter = express.Router({ strict: true });

messageRouter.get("/", async (req, res) => {
  res.json(await db.getAllMessages());
});

messageRouter.get("/:messageId", async (req, res) => {
  const messageId = req.params.messageId;
  const message = await db.getMessage(messageId);
  if (message) res.json(message);
  else res.status(404).send("Message not found");
});

messageRouter.post("/", async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  if (!senderId || !receiverId || !content) {
    res.status(400).send("Sender ID, receiver ID, and content are required");
    return;
  }
  const message = await db.createMessage(senderId, receiverId, content);
  res.json(message);
});

export default messageRouter;
