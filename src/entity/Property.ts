import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Review } from "./Review";
import { User } from "./User";

@Entity()
export class Property {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  area: string;

  @Column()
  district: string;

  @Column()
  subDistrict: string;

  @Column("simple-json", { nullable: true })
  facilities: {
    desc: string;
    measure: number;
    measureUnit: string;
  }[];

  @Column("simple-json", { nullable: true })
  schoolNet: {
    primary: string;
    secondary: string;
  };

  @Column()
  saleableArea: number;

  @Column()
  saleableAreaPricePerSquareFoot: number;

  @Column()
  grossFloorArea: number;

  @Column()
  grossFloorAreaPricePerSquareFoot: number;

  @Column()
  netPrice: number;

  @Column()
  buildingAge: number;

  @Column()
  buildingDirection: string;

  @Column()
  estate: string;

  @Column("simple-json", { nullable: true })
  imageUrls: string[];

  @Column("simple-json", { nullable: true })
  transactionHistory: { date: string; price: number }[];

  @OneToMany(() => Review, (review) => review.reviewedProperty)
  reviews: Review[];

  @Column()
  agentId: string;

  @Column({ nullable: true })
  propertyType: string;

  @Column({ nullable: true, type: 'simple-json' })
  amenities: string[];

  @Column({ nullable: true })
  contractType: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "agentId" })
  agent: User;

  @BeforeInsert()
  formatTransactionHistoryDates() {
    if (this.transactionHistory) {
      this.transactionHistory = this.transactionHistory.map((transaction) => ({
        ...transaction,
        date: new Date(transaction.date).toISOString(),
      }));
    }
  }

  @CreateDateColumn()
  timestamp: Date = new Date();
}
