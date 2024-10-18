import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id: string = "";

    @ManyToOne(() => User, user => user.sentMessages)
    sender: User | undefined;

    @ManyToOne(() => User, user => user.receivedMessages)
    receiver: User | undefined;

    @Column()
    content: string = "";

    @CreateDateColumn()
    timestamp: Date = new Date();
}