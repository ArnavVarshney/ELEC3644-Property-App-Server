import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Property } from "./Property";

@Entity()
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  author: User;

  @Column("decimal", { precision: 2, scale: 1 })
  rating: number;

  @Column()
  content: string;

  @ManyToOne(() => Property, (property) => property.reviews)
  reviewedProperty: Property;

  @ManyToOne(() => User, (user) => user.reviews)
  reviewedUser: User;
}
