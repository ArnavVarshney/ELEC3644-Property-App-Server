import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
  } from "typeorm";
import { User } from "./User";
import { Property } from "./Property";

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @Column()
  folderName: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Property)
  @JoinColumn({ name: "propertyId" })
  property: Property;
}
