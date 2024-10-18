import {Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Group {
    @PrimaryGeneratedColumn("uuid")
    id: string | undefined;

    @CreateDateColumn()
    createdAt: Date = new Date();

    @Column()
    name: string = "";

    @ManyToMany(() => User, user => user.groups)
    users: User[] | undefined;
}