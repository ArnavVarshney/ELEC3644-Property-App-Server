import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id: string | undefined;

  @Column()
  authorId: string = "";

  @Column("float")
  rating: number = 0;

  @Column()
  comment: string = "";

  @ManyToOne(() => User, (user) => user.reviews)
  user: User | undefined;
}
