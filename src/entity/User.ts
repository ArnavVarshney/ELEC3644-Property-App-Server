import {Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
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

    @ManyToMany(() => Group, group => group.users)
    @JoinTable()
    groups: Group[] | undefined;
}