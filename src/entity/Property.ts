import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Review } from "./Review";

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

  @Column("simple-array", { nullable: true })
  imageUrls: string[];

  @Column("simple-json", { nullable: true })
  transactionHistory: {
    date: Date;
    price: number;
  }[];

  @OneToMany(() => Review, (review) => review.reviewedProperty)
  reviews: Review[];
}
