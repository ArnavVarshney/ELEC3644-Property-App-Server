import {Column, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Group {
    @PrimaryGeneratedColumn("uuid")
    id: string = "";

    @Column()
    name: string = "";

    @ManyToMany(() => User, user => user.groups)
    users: User[] | undefined;
}