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
  isActive: boolean;
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
    if (req.body[field] !== undefined) {
      res.status(400).send(`${field} is required`);
      return;
    }
  }

  const property = await createProperty(req.body);
  res.json(property);
});

propertyRouter.post("/query", async (req, res) => {
  try {
    const query = req.body;
    let queryBuilder = AppDataSource.manager.createQueryBuilder(Property, "property").leftJoinAndSelect("property.agent", "agent");


    if (query.name) {
      queryBuilder.andWhere("property.name LIKE :name", { name: `%${query.name}%` });
    }
    if (query.address) {
      queryBuilder.andWhere("property.address LIKE :address", { address: `%${query.address}%` });
    }
    if (query.area) {
      queryBuilder.andWhere("property.area LIKE :area", { area: `%${query.area}%` });
    }
    if (query.district) {
      queryBuilder.andWhere("property.district LIKE :district", { district: `%${query.district}%` });
    }
    if (query.subDistrict) {
      queryBuilder.andWhere("property.subDistrict LIKE :subDistrict", { subDistrict: `%${query.subDistrict}%` });
    }
    if (query.estate) {
      queryBuilder.andWhere("property.estate LIKE :estate", { estate: `%${query.estate}%` });
    }
    if (query.propertyType) {
      if (query.propertyType !== "any") {
        queryBuilder.andWhere("property.propertyType LIKE :propertyType", { propertyType: `%${query.propertyType}%` });
      }
    }
    if (query.contractType) {
      queryBuilder.andWhere("property.contractType LIKE :contractType", { contractType: `%${query.contractType}%` });
    }

    if (query.isActive) {
      queryBuilder.andWhere("property.isActive = :isActive", { isActive: query.isActive });
    }

    if (query.saleableArea) {
      const { min, max } = query.saleableArea;
      if (min !== undefined && max !== undefined) {
        queryBuilder.andWhere("property.saleableArea BETWEEN :minArea AND :maxArea", { minArea: min, maxArea: max });
      } else if (min !== undefined) {
        queryBuilder.andWhere("property.saleableArea >= :minArea", { minArea: min });
      } else if (max !== undefined) {
        queryBuilder.andWhere("property.saleableArea <= :maxArea", { maxArea: max });
      }
    }

    if (query.netPrice) {
      const { min, max } = query.netPrice;
      if (min !== undefined && max !== undefined) {
        queryBuilder.andWhere("property.netPrice BETWEEN :minPrice AND :maxPrice", { minPrice: min, maxPrice: max });
      } else if (min !== undefined) {
        queryBuilder.andWhere("property.netPrice >= :minPrice", { minPrice: min });
      } else if (max !== undefined) {
        queryBuilder.andWhere("property.netPrice <= :maxPrice", { maxPrice: max });
      }
    }

    if (query.buildingAge) {
      const { min, max } = query.buildingAge;
      if (min !== undefined && max !== undefined) {
        queryBuilder.andWhere("property.buildingAge BETWEEN :minAge AND :maxAge", { minAge: min, maxAge: max });
      } else if (min !== undefined) {
        queryBuilder.andWhere("property.buildingAge >= :minAge", { minAge: min });
      } else if (max !== undefined) {
        queryBuilder.andWhere("property.buildingAge <= :maxAge", { maxAge: max });
      }
    }

    if (query.amenities && Array.isArray(query.amenities) && query.amenities.length > 0) {
      query.amenities.map((amenity: string, index: number) => {
        const param = `amenity${index}`;
        queryBuilder.andWhere(`property.amenities LIKE :${param}`, { [param]: `%${amenity}%` });
      });
    }

    const properties = await queryBuilder.getMany();

    res.json(properties);
  } catch (error) {
    console.error("Error in property query:", error);
    res.status(500).send("An error occurred while querying properties");
  }
});

propertyRouter.patch("/:propertyId", async (req, res) => {
  const property = await updateProperty(req.params.propertyId, req.body);
  if (property) res.json(property);
  else res.status(404).send("Property not found");
});

export default propertyRouter;