import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TransactionHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  date: Date;

  @Column()
  price: number;
}
