import "reflect-metadata";
import {User} from "./entity/User";
import {Message} from "./entity/Message";
import {DataSource} from "typeorm";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "./chat.db",
    synchronize: true,
    logging: false,
    entities: [User, Message],
});

export async function initDatabase() {
    await AppDataSource.initialize();
}

export async function saveUser(userId: string, name: string) {
    const user = new User();
    user.id = userId;
    user.name = name;
    await AppDataSource.manager.save(user);
}

export async function saveMessage(messageId: string, senderId: string, receiverId: string, content: string) {
    const message = new Message();
    message.id = messageId;
    message.sender_id = senderId;
    message.receiver_id = receiverId;
    message.content = content;
    await AppDataSource.manager.save(message);
}

export async function getMessages(userId: string, otherId: string) {
    const messageRepository = AppDataSource.getRepository(Message);
    return await messageRepository.find({
        where: [
            {sender_id: userId, receiver_id: otherId},
            {sender_id: otherId, receiver_id: userId}
        ],
        order: {timestamp: "ASC"}
    });
}