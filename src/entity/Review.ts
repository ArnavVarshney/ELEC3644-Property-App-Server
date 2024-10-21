import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  author: string;

  @Column("decimal", { precision: 2, scale: 1 })
  rating: number;

  @Column()
  comment: string;

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;
}
