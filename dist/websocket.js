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
        var _a, _b, _c, _d, _e, _f, _g;
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
                            console.log(`[WS] [${new Date().toLocaleTimeString()}] User set to ${user.id}`);
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
                                receiverId: ((_b = message.sender) === null || _b === void 0 ? void 0 : _b.id).toLocaleLowerCase(),
                                senderId: ((_c = message.sender) === null || _c === void 0 ? void 0 : _c.id).toLocaleLowerCase(),
                                content: message.content,
                                timestamp: message.timestamp,
                            }));
                            for (const [client, user] of clients) {
                                if (user.id === ((_d = message.receiver) === null || _d === void 0 ? void 0 : _d.id).toLocaleLowerCase()) {
                                    client.send(JSON.stringify({
                                        type: "newMessage",
                                        id: message.id,
                                        senderId: ((_e = message.sender) === null || _e === void 0 ? void 0 : _e.id).toLocaleLowerCase(),
                                        receiverId: ((_f = message.receiver) === null || _f === void 0 ? void 0 : _f.id).toLocaleLowerCase(),
                                        content: message.content,
                                        timestamp: message.timestamp,
                                    }));
                                }
                            }
                            console.log(`[WS] [${new Date().toLocaleTimeString()}] Message sent from user ${userId} to user ${((_g = message.receiver) === null || _g === void 0 ? void 0 : _g.id).toLocaleLowerCase()}: ${message.content}`);
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
                case "addWishlist":
                    if (!userId)
                        break;
                    let addedWishlist = yield (0, userRoutes_1.addWishlist)(userId, data.propertyId, data.folderName);
                    if (addedWishlist) {
                        ws.send(JSON.stringify({
                            type: "wishlistAdd",
                            addedWishlist
                        }));
                    }
                    break;
                case "removeWishlist":
                    if (!userId)
                        break;
                    let removedWishlist = yield (0, userRoutes_1.removeWishlist)(userId, data.propertyId, data.folderName);
                    if (removedWishlist) {
                        ws.send(JSON.stringify({
                            type: "wishlistRemove",
                            removedWishlist
                        }));
                    }
                    break;
                case "getWishlist":
                    if (!userId)
                        break;
                    const rows = yield (0, userRoutes_1.getWishlists)(userId);
                    let folderNames = [];
                    let properties = [];
                    for (const row of rows) {
                        if (!folderNames.includes(row.folderName)) {
                            folderNames.push(row.folderName);
                            properties.push([row.property]);
                        }
                        else {
                            let idx = folderNames.findIndex((name) => name === row.folderName);
                            properties[idx].push(row.property);
                        }
                    }
                    let wishlists = [];
                    for (let i = 0; i < folderNames.length; ++i) {
                        const wishlist = {
                            "name": folderNames[i],
                            "properties": properties[i]
                        };
                        wishlists.push(wishlist);
                    }
                    ws.send(JSON.stringify({
                        type: "wishlistGet",
                        wishlists
                    }));
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
