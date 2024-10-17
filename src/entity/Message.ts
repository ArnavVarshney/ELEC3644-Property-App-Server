import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class Message {
    @PrimaryColumn()
    id: string = "";

    @Column()
    sender_id: string = "";

    @Column()
    receiver_id: string = "";

    @Column()
    content: string = "";

    @Column({type: "datetime", default: () => "CURRENT_TIMESTAMP"})
    timestamp: string = "";
}