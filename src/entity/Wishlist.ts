import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne
  } from "typeorm";
import { User } from "./User";
import { Property } from "./Property";

@Entity()
export class Wishlist {
  @Column()
  folderName: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Property)
  @JoinColumn({ name: "propertyId" })
  property: Property;
}
