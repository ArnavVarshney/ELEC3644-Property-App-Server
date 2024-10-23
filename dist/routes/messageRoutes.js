"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = createMessage;
exports.getMessage = getMessage;
exports.getMessages = getMessages;
exports.getChat = getChat;
exports.getAllMessages = getAllMessages;
const database_1 = require("../database");
const express_1 = __importDefault(require("express"));
const Message_1 = require("../entity/Message");
const User_1 = require("../entity/User");
const messageRouter = express_1.default.Router({ strict: true });
function createMessage(senderId, receiverId, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = new Message_1.Message();
        const sender = yield database_1.AppDataSource.manager.findOne(User_1.User, {
            where: { id: senderId },
        });
        const receiver = yield database_1.AppDataSource.manager.findOne(User_1.User, {
            where: { id: receiverId },
        });
        if (sender && receiver) {
            message.sender = sender;
            message.receiver = receiver;
            message.content = content;
            yield database_1.AppDataSource.manager.save(message);
            return message;
        }
    });
}
function getMessage(messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.AppDataSource.manager.findOne(Message_1.Message, { where: { id: messageId }, relations: ["sender", "receiver"] });
    });
}
function getMessages(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const messageRepository = database_1.AppDataSource.getRepository(Message_1.Message);
        return messageRepository.find({
            where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
            select: ["id", "content", "senderId", "receiverId"],
        });
    });
}
function getChat(userId1, userId2) {
    return __awaiter(this, void 0, void 0, function* () {
        const messageRepository = database_1.AppDataSource.getRepository(Message_1.Message);
        return messageRepository.find({
            where: [
                { sender: { id: userId1 }, receiver: { id: userId2 } },
                { sender: { id: userId2 }, receiver: { id: userId1 } },
            ],
            select: ["id", "content", "senderId", "receiverId"],
        });
    });
}
function getAllMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.AppDataSource.manager.find(Message_1.Message, { relations: ["sender", "receiver"] });
    });
}
messageRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getAllMessages());
}));
messageRouter.get("/:messageId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messageId = req.params.messageId;
    const message = yield getMessage(messageId);
    if (message)
        res.json(message);
    else
        res.status(404).send("Message not found");
}));
messageRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) {
        res.status(400).send("Sender ID, receiver ID, and content are required");
        return;
    }
    const message = yield createMessage(senderId, receiverId, content);
    res.json(message);
}));
messageRouter.get("/chat/:senderId/:receiverId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.params;
    if (!senderId || !receiverId) {
        res.status(400).send("User IDs are required");
        return;
    }
    else {
        const messages = yield getChat(senderId, receiverId);
        res.json(messages);
    }
}));
messageRouter.get("/chat/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const messages = yield getMessages(userId);
    const chat = {};
    messages.forEach((message) => {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        if (chat[otherUserId])
            chat[otherUserId].push(message);
        else
            chat[otherUserId] = [message];
    });
    res.json(chat);
}));
exports.default = messageRouter;
