import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Review } from "./Review";
import { compare, hash } from "bcrypt";
import { Property } from "./Property";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean = true;

  @Column({ nullable: true })
  avatarUrl: string;

  @CreateDateColumn()
  createdAt: Date = new Date();

  @OneToMany(() => Review, (review) => review.reviewedUser)
  reviews: Review[];

  @OneToMany(() => Property, (property) => property.agent)
  propertyListings: Property[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  async comparePassword(password: string) {
    return await compare(password, this.password);
  }
}
