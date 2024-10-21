import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Group } from "./Group";
import { Review } from "./Review";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string | undefined;

    @Column()
    name: string = "";

    @Column()
    email: string = "";

    @Column()
    avatarUrl: string = "";

    @CreateDateColumn()
    createdAt: Date = new Date();

    @ManyToMany(() => Group, group => group.users)
    @JoinTable()
    groups: Group[] | undefined;

    @OneToMany(() => Review, review => review.user)
    reviews: Review[] | undefined;
}