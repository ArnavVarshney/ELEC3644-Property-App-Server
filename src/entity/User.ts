import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryColumn()
    id: string = "";

    @Column({nullable: true})
    name: string  = "";
}