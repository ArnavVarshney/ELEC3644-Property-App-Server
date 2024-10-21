import "reflect-metadata";
import { User } from "./entity/User";
import { Message } from "./entity/Message";
import { Group } from "./entity/Group";
import { Review } from "./entity/Review";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./chat.db",
  synchronize: true,
  logging: true,
  entities: [User, Message, Group, Review],
});

export async function initDatabase() {
  await AppDataSource.initialize();
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  avatarUrl?: string,
) {
  const user = new User();
  user.name = name;
  user.email = email;
  user.password = password;
  user.avatarUrl = avatarUrl ?? "";
  await AppDataSource.manager.save(user);
  return user;
}

export async function updateUser(
  userId: string,
  name?: string,
  avatarUrl?: string,
) {
  const user = await AppDataSource.manager.findOne(User, {
    where: { id: userId },
  });
  if (user) {
    user.name = name ?? user.name;
    user.avatarUrl = avatarUrl ?? user.avatarUrl;
    await AppDataSource.manager.save(user);
    return user;
  }
}

export async function getUser(userId: string) {
  return AppDataSource.manager.findOne(User, { where: { id: userId } });
}

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

export async function getMessages(userId: string) {
  const messageRepository = AppDataSource.getRepository(Message);
  return messageRepository.find({
    where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
  });
}
