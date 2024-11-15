import { AppDataSource } from "../database";
import express from "express";
import { Property } from "../entity/Property";

const propertyRouter = express.Router({ strict: true });

interface PropertyType {
  name: string;
  address: string;
  area: string;
  district: string;
  subDistrict: string;
  facilities: { desc: string; measure: number; measureUnit: string }[];
  schoolNet: { primary: string; secondary: string };
  saleableArea: number;
  saleableAreaPricePerSquareFoot: number;
  grossFloorArea: number;
  grossFloorAreaPricePerSquareFoot: number;
  netPrice: number;
  buildingAge: number;
  buildingDirection: string;
  estate: string;
  imageUrls?: string[];
  transactionHistory?: { date: string; price: number }[];
  agentId: string;
  contractType: string;
  amenities: string[];
  propertyType: string;
}


export async function createProperty(data: PropertyType) {
  const property = AppDataSource.manager.create(Property, data);
  await AppDataSource.manager.save(property);
  return property;
}

export async function updateProperty(propertyId: string, data: Partial<PropertyType>) {
  const property = await AppDataSource.manager.findOne(Property, {
    where: { id: propertyId },
  });

  if (property) {
    Object.assign(property, data);
    await AppDataSource.manager.save(property);
    return property;
  }

  return null;
}

export async function getProperty(propertyId: string) {
  return AppDataSource.manager.findOne(Property, {
    where: { id: propertyId },
    relations: ["agent"],
  });
}

export async function getProperties() {
  return AppDataSource.manager.find(Property, { relations: ["agent"] });
}

propertyRouter.get("/", async (req, res) => {
  const properties = await getProperties();
  res.json(properties);
});

propertyRouter.get("/:propertyId", async (req, res) => {
  const property = await getProperty(req.params.propertyId);
  if (property) res.json(property);
  else res.status(404).send("Property not found");
});

propertyRouter.post("/", async (req, res) => {
  const requiredFields = [
    "name", "address", "area", "district", "subDistrict", "saleableArea",
    "saleableAreaPricePerSquareFoot", "grossFloorArea",
    "grossFloorAreaPricePerSquareFoot", "netPrice", "buildingAge",
    "buildingDirection", "estate", "agentId", "propertyType", "amenities",
    "contractType"
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      res.status(400).send(`${field} is required`);
      return;
    }
  }

  const property = await createProperty(req.body);
  res.json(property);
});

propertyRouter.patch("/:propertyId", async (req, res) => {
  const property = await updateProperty(req.params.propertyId, req.body);
  if (property) res.json(property);
  else res.status(404).send("Property not found");
});

export default propertyRouter;