import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Group } from "./Group";
import { Review } from "./Review";
import { hash } from "node:crypto";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean = true;

  @Column({ nullable: true })
  avatarUrl: string;

  @CreateDateColumn()
  createdAt: Date = new Date();

  @ManyToMany(() => Group, (group) => group.users)
  @JoinTable()
  groups: Group[];

  @OneToMany(() => Review, (review) => review.reviewedUser)
  reviews: Review[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = hash("sha256", this.password);
  }

  async comparePassword(password: string) {
    return this.password === hash("sha256", password);
  }
}
