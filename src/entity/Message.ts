import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "senderId" })
  sender: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "receiverId" })
  receiver: User;

  @Column()
  content: string;

  @CreateDateColumn()
  timestamp: Date = new Date();
}
