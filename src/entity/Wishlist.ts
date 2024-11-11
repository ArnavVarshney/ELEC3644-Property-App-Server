import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Property } from "./Property";

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  folderName: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: "propertyId" })
  property: Property;

  @CreateDateColumn()
  timestamp: Date = new Date();
}
