import { AppDataSource } from "../database";
import express from "express";
import { Message } from "../entity/Message";
import { User } from "../entity/User";

const messageRouter = express.Router({ strict: true });

export async function createMessage(
  senderId: string,
  receiverId: string,
  content: string,
) {
  const message = new Message();
  const sender = await AppDataSource.manager.findOne(User, {
    where: { id: senderId },
  });
  const receiver = await AppDataSource.manager.findOne(User, {
    where: { id: receiverId },
  });
  if (sender && receiver) {
    message.sender = sender;
    message.receiver = receiver;
    message.content = content;
    await AppDataSource.manager.save(message);
    return message;
  }
}

export async function getMessage(messageId: string) {
  return AppDataSource.manager.findOne(Message, { where: { id: messageId }, relations: ["sender", "receiver"] });
}

export async function getMessages(userId: string) {
  const messageRepository = AppDataSource.getRepository(Message);
  return messageRepository.find({
    where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
    relations: ["sender", "receiver"]
  });
}

export async function getChat(userId1: string, userId2: string) {
  const messageRepository = AppDataSource.getRepository(Message);
  return messageRepository.find({
    where: [
      { sender: { id: userId1 }, receiver: { id: userId2 } },
      { sender: { id: userId2 }, receiver: { id: userId1 } },
    ],
    select: ["id", "content", "senderId"],
  });
}

export async function getAllMessages() {
  return AppDataSource.manager.find(Message, { relations: ["sender", "receiver"] });
}

messageRouter.get("/", async (req, res) => {
  res.json(await getAllMessages());
});

messageRouter.get("/:messageId", async (req, res) => {
  const messageId = req.params.messageId;
  const message = await getMessage(messageId);
  if (message) res.json(message);
  else res.status(404).send("Message not found");
});

messageRouter.post("/", async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  if (!senderId || !receiverId || !content) {
    res.status(400).send("Sender ID, receiver ID, and content are required");
    return;
  }
  const message = await createMessage(senderId, receiverId, content);
  res.json(message);
});

messageRouter.get("/chat/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  if (!senderId || !receiverId) {
    res.status(400).send("User IDs are required");
    return;
  } else {
    const messages = await getChat(senderId, receiverId);
    res.json(messages);
  }
});

export default messageRouter;
