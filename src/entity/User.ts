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
  id: string | undefined;

  @Column()
  name: string = "";

  @Column({ unique: true })
  email: string = "";

  @Column({ select: false })
  password: string = "";

  @Column()
  avatarUrl: string = "";

  @CreateDateColumn()
  createdAt: Date = new Date();

  @ManyToMany(() => Group, (group) => group.users)
  @JoinTable()
  groups: Group[] | undefined;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[] | undefined;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = hash(this.password, "sha256");
  }

  async comparePassword(password: string) {
    return this.password === hash(password, "sha256");
  }
}
