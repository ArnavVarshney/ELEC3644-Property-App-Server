import "reflect-metadata";
import { User } from "./entity/User";
import { Message } from "./entity/Message";
import { Group } from "./entity/Group";
import { Review } from "./entity/Review";
import { DataSource } from "typeorm";
import { Property } from "./entity/Property";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./chat.db",
  synchronize: true,
  logging: true,
  entities: [User, Message, Group, Review, Property],
});

export async function initDatabase() {
  await AppDataSource.initialize();
}
