import "reflect-metadata";
import {User} from "./entity/User";
import {Message} from "./entity/Message";
import {DataSource} from "typeorm";
import {Group} from "./entity/Group";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "./chat.db",
    synchronize: true,
    logging: true,
    entities: [User, Message, Group],
});

export async function initDatabase() {
    await AppDataSource.initialize();
}

export async function saveUser(userId: string, firstName: string, lastName: string) {
    const user = new User();
    user.id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    await AppDataSource.manager.save(user);
}

export async function saveMessage(messageId: string, senderId: string, receiverId: string, content: string) {
    const message = new Message();
    message.id = messageId;
    const sender = await AppDataSource.manager.findOne(User, {where: {id: senderId}});
    if (sender)
        message.sender = sender;
    const receiver = await AppDataSource.manager.findOne(User, {where: {id: receiverId}});
    if (receiver)
        message.receiver = receiver;
    message.content = content;
    await AppDataSource.manager.save(message);
}

export async function getMessages(userId: string) {
    const messageRepository = AppDataSource.getRepository(Message);
    return messageRepository.find({
        where: [
            {sender: {id: userId}},
            {receiver: {id: userId}}
        ]
    });
}