import { AppDataSource } from "../database";
import express from "express";
import { Property } from "../entity/Property";

const propertyRouter = express.Router({ strict: true });

export async function createProperty(
  name: string,
  address: string,
  area: string,
  district: string,
  subDistrict: string,
  facilities: { desc: string; measure: number; measureUnit: string }[],
  schoolNet: { primary: string; secondary: string },
  saleableArea: number,
  saleableAreaPricePerSquareFoot: number,
  grossFloorArea: number,
  grossFloorAreaPricePerSquareFoot: number,
  netPrice: number,
  buildingAge: number,
  buildingDirection: string,
  estate: string,
  imageUrls?: string[],
  transactionHistory?: { date: Date; price: number }[],
) {
  const property = new Property();
  property.name = name;
  property.address = address;
  property.area = area;
  property.district = district;
  property.subDistrict = subDistrict;
  property.facilities = facilities;
  property.schoolNet = schoolNet;
  property.saleableArea = saleableArea;
  property.saleableAreaPricePerSquareFoot = saleableAreaPricePerSquareFoot;
  property.grossFloorArea = grossFloorArea;
  property.grossFloorAreaPricePerSquareFoot = grossFloorAreaPricePerSquareFoot;
  property.netPrice = netPrice;
  property.buildingAge = buildingAge;
  property.buildingDirection = buildingDirection;
  property.estate = estate;
  property.imageUrls = imageUrls ?? [];
  property.transactionHistory = transactionHistory ?? [];

  await AppDataSource.manager.save(property);
  return property;
}

export async function updateProperty(
  propertyId: string,
  name?: string,
  address?: string,
  area?: string,
  district?: string,
  subDistrict?: string,
  facilities?: { desc: string; measure: number; measureUnit: string }[],
  schoolNet?: { primary: string; secondary: string },
  saleableArea?: number,
  saleableAreaPricePerSquareFoot?: number,
  grossFloorArea?: number,
  grossFloorAreaPricePerSquareFoot?: number,
  netPrice?: number,
  buildingAge?: number,
  buildingDirection?: string,
  estate?: string,
  imageUrls?: string[],
  transactionHistory?: { date: Date; price: number }[],
) {
  const property = await AppDataSource.manager.findOne(Property, {
    where: { id: propertyId },
  });
  if (property) {
    property.name = name ?? property.name;
    property.address = address ?? property.address;
    property.area = area ?? property.area;
    property.district = district ?? property.district;
    property.subDistrict = subDistrict ?? property.subDistrict;
    property.facilities = facilities ?? property.facilities;
    property.schoolNet = schoolNet ?? property.schoolNet;
    property.saleableArea = saleableArea ?? property.saleableArea;
    property.saleableAreaPricePerSquareFoot =
      saleableAreaPricePerSquareFoot ?? property.saleableAreaPricePerSquareFoot;
    property.grossFloorArea = grossFloorArea ?? property.grossFloorArea;
    property.grossFloorAreaPricePerSquareFoot =
      grossFloorAreaPricePerSquareFoot ??
      property.grossFloorAreaPricePerSquareFoot;
    property.netPrice = netPrice ?? property.netPrice;
    property.buildingAge = buildingAge ?? property.buildingAge;
    property.buildingDirection =
      buildingDirection ?? property.buildingDirection;
    property.estate = estate ?? property.estate;
    property.imageUrls = imageUrls ?? property.imageUrls;
    property.transactionHistory =
      transactionHistory ?? property.transactionHistory;

    await AppDataSource.manager.save(property);
    return property;
  }
}

export async function getProperty(propertyId: string) {
  return AppDataSource.manager.findOne(Property, { where: { id: propertyId } });
}

export async function getProperties() {
  return AppDataSource.manager.find(Property);
}

propertyRouter.get("/", async (req, res) => {
  res.json(await getProperties());
});

propertyRouter.get("/:propertyId", async (req, res) => {
  const propertyId = req.params.propertyId;
  const property = await getProperty(propertyId);
  if (property) res.json(property);
  else res.status(404).send("Property not found");
});

propertyRouter.post("/", async (req, res) => {
  const {
    name,
    address,
    area,
    district,
    subDistrict,
    facilities,
    schoolNet,
    saleableArea,
    saleableAreaPricePerSquareFoot,
    grossFloorArea,
    grossFloorAreaPricePerSquareFoot,
    netPrice,
    buildingAge,
    buildingDirection,
    estate,
    imageUrls,
    transactionHistory,
  } = req.body;
  if (
    !name ||
    !address ||
    !area ||
    !district ||
    !subDistrict ||
    !saleableArea ||
    !saleableAreaPricePerSquareFoot ||
    !grossFloorArea ||
    !grossFloorAreaPricePerSquareFoot ||
    !netPrice ||
    !buildingAge ||
    !buildingDirection ||
    !estate
  ) {
    res.status(400).send("All fields are required");
    return;
  }
  const property = await createProperty(
    name,
    address,
    area,
    district,
    subDistrict,
    facilities,
    schoolNet,
    saleableArea,
    saleableAreaPricePerSquareFoot,
    grossFloorArea,
    grossFloorAreaPricePerSquareFoot,
    netPrice,
    buildingAge,
    buildingDirection,
    estate,
    imageUrls,
    transactionHistory,
  );
  res.json(property);
});

propertyRouter.patch("/:propertyId", async (req, res) => {
  const propertyId = req.params.propertyId;
  const {
    name,
    address,
    area,
    district,
    subDistrict,
    facilities,
    schoolNet,
    saleableArea,
    saleableAreaPricePerSquareFoot,
    grossFloorArea,
    grossFloorAreaPricePerSquareFoot,
    netPrice,
    buildingAge,
    buildingDirection,
    estate,
    imageUrls,
    transactionHistory,
  } = req.body;
  const property = await updateProperty(
    propertyId,
    name,
    address,
    area,
    district,
    subDistrict,
    facilities,
    schoolNet,
    saleableArea,
    saleableAreaPricePerSquareFoot,
    grossFloorArea,
    grossFloorAreaPricePerSquareFoot,
    netPrice,
    buildingAge,
    buildingDirection,
    estate,
    imageUrls,
    transactionHistory,
  );
  if (property) res.json(property);
  else res.status(404).send("Property not found");
});

export default propertyRouter;
