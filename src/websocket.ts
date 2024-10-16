import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import { saveUser, saveMessage, getMessages } from "./database";
import { User } from "./interfaces";

const clients = new Map<WebSocket, User>();

export function handleWS(ws: WebSocket) {
	const userId = uuidv4();
	clients.set(ws, { id: userId, name: null });

	ws.on("message", async (message: string) => {
		const data = JSON.parse(message);

		switch (data.type) {
			case "setName":
				const user = clients.get(ws);
				if (user) {
					user.name = data.name;
					await saveUser(userId, data.name);
				}
				break;
			case "sendMessage":
				const sender = clients.get(ws);
				if (sender?.name && data.receiverId) {
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
									senderName: sender.name,
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

	ws.send(JSON.stringify({ type: "userId", id: userId }));
}
