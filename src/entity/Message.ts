import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string | undefined;

  @ManyToOne(() => User)
  sender: User | undefined;

  @ManyToOne(() => User)
  receiver: User | undefined;

  @Column()
  content: string = "";

  @CreateDateColumn()
  timestamp: Date = new Date();
}
