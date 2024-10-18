import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {Group} from "./Group";
import {Message} from "./Message";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string | undefined;

    @CreateDateColumn()
    createdAt: Date = new Date();

    @Column()
    firstName: string = "";

    @Column()
    lastName: string = "";

    @OneToMany(() => Message, message => message.sender)
    sentMessages: Message[] | undefined;

    @OneToMany(() => Message, message => message.receiver)
    receivedMessages: Message[] | undefined;

    @ManyToMany(() => Group, group => group.users)
    @JoinTable()
    groups: Group[] | undefined;
}