import WebSocket from "ws";
import { User } from "./entity/User";
import { getUser } from "./routes/userRoutes";
import { createMessage, getMessages } from "./routes/messageRoutes";

const clients = new Map<WebSocket, User>();

export function handleWS(ws: WebSocket) {
  clients.set(ws, new User());

  ws.on("message", async (message: string) => {
    try {
      const data = JSON.parse(message);
      const userId = clients.get(ws)?.id;

      switch (data.type) {
        case "setUser":
          if (userId) break;
          if (data.userId) {
            const user = await getUser(data.userId);
            if (user) {
              clients.set(ws, user);
              ws.send(
                JSON.stringify({
                  type: "userSet",
                  userId: user.id,
                }),
              );
            }
          }
          break;

        case "sendMessageToUser":
          if (!userId) break;
          if ((data.receiverId || data.receiverEmail) && data.content) {
            const message = await createMessage(
              userId,
              data.content,
              data.receiverId,
              data.receiverEmail,
            );
            if (message) {
              ws.send(
                JSON.stringify({
                  type: "newMessage",
                  id: message.id,
                  receiverId: message.sender?.id,
                  content: message.content,
                  timestamp: message.timestamp,
                }),
              );

              ws.send(
                JSON.stringify({
                  type: "messageSent",
                  id: message.id,
                  receiverId: message.receiver?.id,
                  content: message.content,
                  timestamp: message.timestamp,
                }),
              );
            }
          }
          break;

        case "getMessages":
          if (!userId) break;
          const messages = await getMessages(userId);
          ws.send(
            JSON.stringify({
              type: "messageHistory",
              messages: messages,
            }),
          );
          break;

        case "ping":
          ws.send(JSON.stringify({ type: "pong" }));
          break;
      }
    } catch (e) {
      console.error(e);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });

  ws.send(JSON.stringify({ type: "connected" }));
}
