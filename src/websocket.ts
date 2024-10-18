import WebSocket from "ws";
import {v4 as uuidv4} from "uuid";
import {getMessages, saveMessage, saveUser} from "./database";
import {User} from "./entity/User";

const clients = new Map<WebSocket, User>();

export function handleWS(ws: WebSocket) {
    const userId = uuidv4();
    const user = new User();
    user.id = userId;
    clients.set(ws, user);

    ws.on("message", async (message: string) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case "setName":
                const user = clients.get(ws);
                if (user) {
                    user.firstName = data.firstName;
                    user.lastName = data.lastName;
                    await saveUser(userId, data.firstName, data.lastName);
                }
                break;
            case "sendMessage":
                const sender = clients.get(ws);
                if (sender?.firstName && data.receiverId) {
                    const messageId = uuidv4();
                    const timestamp = new Date().toISOString();
                    console.log(messageId, timestamp);
                    try {
                        await saveMessage(messageId, sender.id, data.receiverId, data.content);
                        for (const [clientWs, clientUser] of clients.entries()) {
                            if (clientUser.id === data.receiverId) {
                                const messageToSend = JSON.stringify({
                                    type: 'newMessage',
                                    id: messageId,
                                    senderId: sender.id,
                                    firstName: sender.firstName,
                                    lastName: sender.lastName,
                                    content: data.content,
                                    timestamp: timestamp
                                });
                                clientWs.send(messageToSend);
                                break;
                            }
                        }
                        ws.send(JSON.stringify({
                            type: 'messageSent',
                            id: messageId,
                            receiverId: data.receiverId,
                            content: data.content,
                            timestamp: timestamp
                        }));
                    } catch (err) {
                        console.error("Error saving message:", err);
                    }
                }
                break;
            case "fetchMessages":
                try {
                    const messages = await getMessages(userId, data.otherId);
                    ws.send(JSON.stringify({
                        type: "messageHistory",
                        messages: messages
                    }));
                } catch (err) {
                    console.error("Error fetching messages:", err);
                }
                break;
        }
    });

    ws.on("close", () => {
        clients.delete(ws);
    });

    ws.send(JSON.stringify({type: "userId", id: userId}));
}