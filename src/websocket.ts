import WebSocket from "ws";
import { User } from "./entity/User";
import { Property } from "./entity/Property";
import { getUser, addWishlist, removeWishlist, getWishlists } from "./routes/userRoutes";
import { createMessage, getMessages } from "./routes/messageRoutes";
import { AppDataSource } from "./database";
import { Wishlist } from "./entity/Wishlist";

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
              console.log(
                `[WS] [${new Date().toLocaleTimeString()}] User set to ${user.id}`,
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
                  receiverId: (message.sender?.id).toLocaleLowerCase(),
                  senderId: (message.sender?.id).toLocaleLowerCase(),
                  content: message.content,
                  timestamp: message.timestamp,
                }),
              );

              for (const [client, user] of clients) {
                if (user.id === (message.receiver?.id).toLocaleLowerCase()) {
                  client.send(
                    JSON.stringify({
                      type: "newMessage",
                      id: message.id,
                      senderId: (message.sender?.id).toLocaleLowerCase(),
                      receiverId: (message.receiver?.id).toLocaleLowerCase(),
                      content: message.content,
                      timestamp: message.timestamp,
                    }),
                  );
                }
              }

              console.log(
                `[WS] [${new Date().toLocaleTimeString()}] Message sent from user ${userId} to user ${(message.receiver?.id).toLocaleLowerCase()}: ${message.content}`,
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
        
        case "addWishlist":
          if (!userId) break;
          let addedWishlist = await addWishlist(userId, data.propertyId, data.folderName);
          if(addedWishlist){
            ws.send(
              JSON.stringify({
                type: "wishlistAdd",
                addedWishlist
              })
            );
          }
          break;

        case "removeWishlist":
          if (!userId) break;
          let removedWishlist = await removeWishlist(userId, data.propertyId, data.folderName);
          if(removedWishlist){
            ws.send(
              JSON.stringify(
                {
                  type: "wishlistRemove",
                  removedWishlist
                }
              )
            );
          }
          break;

        case "getWishlist":
          if (!userId) break;
          const rows = await getWishlists(userId);

          let folderNames: string[] = []
          let properties: Property[][] = []
          for(const row of rows){
            if(!folderNames.includes(row.folderName)){
              folderNames.push(row.folderName)
              properties.push([row.property])
            }else{
              let idx = folderNames.findIndex((name)=>name === row.folderName)
              properties[idx].push(row.property)
            }
          }

          let wishlists = []
          for(let i=0; i<folderNames.length; ++i){
            const wishlist = {
              "name": folderNames[0],
              "properties": properties[0]
            }
            wishlists.push(wishlist)
          }

          ws.send(
            JSON.stringify(
              {
                type: "wishlistGet",
                wishlists
              }
            )
          );
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
