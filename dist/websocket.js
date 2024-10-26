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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWS = handleWS;
const User_1 = require("./entity/User");
const userRoutes_1 = require("./routes/userRoutes");
const messageRoutes_1 = require("./routes/messageRoutes");
const clients = new Map();
function handleWS(ws) {
    clients.set(ws, new User_1.User());
    ws.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const data = JSON.parse(message);
            const userId = (_a = clients.get(ws)) === null || _a === void 0 ? void 0 : _a.id;
            switch (data.type) {
                case "setUser":
                    if (userId)
                        break;
                    if (data.userId) {
                        const user = yield (0, userRoutes_1.getUser)(data.userId);
                        if (user) {
                            clients.set(ws, user);
                            ws.send(JSON.stringify({
                                type: "userSet",
                                userId: user.id,
                            }));
                        }
                    }
                    break;
                case "sendMessageToUser":
                    if (!userId)
                        break;
                    if ((data.receiverId || data.receiverEmail) && data.content) {
                        const message = yield (0, messageRoutes_1.createMessage)(userId, data.content, data.receiverId, data.receiverEmail);
                        if (message) {
                            ws.send(JSON.stringify({
                                type: "newMessage",
                                id: message.id,
                                receiverId: (_b = message.sender) === null || _b === void 0 ? void 0 : _b.id,
                                content: message.content,
                                timestamp: message.timestamp,
                            }));
                            ws.send(JSON.stringify({
                                type: "messageSent",
                                id: message.id,
                                receiverId: (_c = message.receiver) === null || _c === void 0 ? void 0 : _c.id,
                                content: message.content,
                                timestamp: message.timestamp,
                            }));
                        }
                    }
                    break;
                case "getMessages":
                    if (!userId)
                        break;
                    const messages = yield (0, messageRoutes_1.getMessages)(userId);
                    ws.send(JSON.stringify({
                        type: "messageHistory",
                        messages: messages,
                    }));
                    break;
                case "ping":
                    ws.send(JSON.stringify({ type: "pong" }));
                    break;
            }
        }
        catch (e) {
            console.error(e);
        }
    }));
    ws.on("close", () => {
        clients.delete(ws);
    });
    ws.send(JSON.stringify({ type: "connected" }));
}
