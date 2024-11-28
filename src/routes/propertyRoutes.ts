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
  vrImageUrls: { name: string; url: string }[];
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

export async function updateProperty(
  propertyId: string,
  data: Partial<PropertyType>,
) {
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
    "name",
    "address",
    "area",
    "district",
    "subDistrict",
    "saleableArea",
    "saleableAreaPricePerSquareFoot",
    "grossFloorArea",
    "grossFloorAreaPricePerSquareFoot",
    "netPrice",
    "buildingAge",
    "buildingDirection",
    "estate",
    "agent",
    "propertyType",
    "amenities",
    "contractType",
  ];

  for (const field of requiredFields) {
    if (req.body[field] === undefined) {
      res.status(400).send(`${field} is required`);
      return;
    }
  }

  if (req.body.agent !== undefined) {
    req.body.agentId = req.body.agent.toLowerCase();
  }
  req.body.transactionHistory = [];
  req.body.id = undefined;
  req.body.amenities = JSON.parse(req.body.amenities);
  req.body.schoolNet = JSON.parse(req.body.schoolNet);
  req.body.facilities = JSON.parse(req.body.facilities);
  req.body.imageUrls = JSON.parse(req.body.imageUrls);
  req.body.vrImageUrls = JSON.parse(req.body.vrImageUrls);

  const property = await createProperty(req.body);
  res.json(property);
});

propertyRouter.post("/query", async (req, res) => {
  try {
    const query = req.body;
    let queryBuilder = AppDataSource.manager
      .createQueryBuilder(Property, "property")
      .leftJoinAndSelect("property.agent", "agent");

    if (query.name) {
      queryBuilder.andWhere("property.name LIKE :name", {
        name: `%${query.name}%`,
      });
    }
    if (query.address) {
      queryBuilder.andWhere("property.address LIKE :address", {
        address: `%${query.address}%`,
      });
    }
    if (query.area) {
      if (query.area !== "any") {
        queryBuilder.andWhere("property.area LIKE :area", {
          area: `%${query.area}%`,
        });
      }
    }
    if (query.district) {
      if (query.district !== "any") {
        queryBuilder.andWhere("property.district LIKE :district", {
          district: `%${query.district}%`,
        });
      }
    }
    if (query.subDistrict) {
      if (query.subDistrict !== "any") {
        queryBuilder.andWhere("property.subDistrict LIKE :subDistrict", {
          subDistrict: `%${query.subDistrict}%`,
        });
      }
    }
    if (query.estate) {
      queryBuilder.andWhere("property.estate LIKE :estate", {
        estate: `%${query.estate}%`,
      });
    }
    if (query.propertyType) {
      if (query.propertyType !== "any") {
        queryBuilder.andWhere("property.propertyType LIKE :propertyType", {
          propertyType: `%${query.propertyType}%`,
        });
      }
    }
    if (query.contractType) {
      queryBuilder.andWhere("property.contractType LIKE :contractType", {
        contractType: `%${query.contractType}%`,
      });
    }

    if (query.isActive) {
      queryBuilder.andWhere("property.isActive = :isActive", {
        isActive: query.isActive,
      });
    }

    if (
      query.minSaleableArea !== undefined ||
      query.maxSaleableArea !== undefined
    ) {
      if (
        query.minSaleableArea !== undefined &&
        query.maxSaleableArea !== undefined
      ) {
        queryBuilder.andWhere(
          "property.saleableArea BETWEEN :minArea AND :maxArea",
          {
            minArea: query.minSaleableArea,
            maxArea: query.maxSaleableArea,
          },
        );
      } else if (query.minSaleableArea !== undefined) {
        queryBuilder.andWhere("property.saleableArea >= :minArea", {
          minArea: query.minSaleableArea,
        });
      } else if (query.maxSaleableArea !== undefined) {
        queryBuilder.andWhere("property.saleableArea <= :maxArea", {
          maxArea: query.maxSaleableArea,
        });
      }
    }

    if (query.minNetPrice !== undefined || query.maxNetPrice !== undefined) {
      if (query.minNetPrice !== undefined && query.maxNetPrice !== undefined) {
        queryBuilder.andWhere(
          "property.netPrice BETWEEN :minPrice AND :maxPrice",
          {
            minPrice: query.minNetPrice,
            maxPrice: query.maxNetPrice,
          },
        );
      } else if (query.minNetPrice !== undefined) {
        queryBuilder.andWhere("property.netPrice >= :minPrice", {
          minPrice: query.minNetPrice,
        });
      } else if (query.maxNetPrice !== undefined) {
        queryBuilder.andWhere("property.netPrice <= :maxPrice", {
          maxPrice: query.maxNetPrice,
        });
      }
    }

    if (
      query.minBuildingAge !== undefined ||
      query.maxBuildingAge !== undefined
    ) {
      if (
        query.minBuildingAge !== undefined &&
        query.maxBuildingAge !== undefined
      ) {
        queryBuilder.andWhere(
          "property.buildingAge BETWEEN :minAge AND :maxAge",
          {
            minAge: query.minBuildingAge,
            maxAge: query.maxBuildingAge,
          },
        );
      } else if (query.minBuildingAge !== undefined) {
        queryBuilder.andWhere("property.buildingAge >= :minAge", {
          minAge: query.minBuildingAge,
        });
      } else if (query.maxBuildingAge !== undefined) {
        queryBuilder.andWhere("property.buildingAge <= :maxAge", {
          maxAge: query.maxBuildingAge,
        });
      }
    }

    if (
      query.amenities &&
      Array.isArray(query.amenities) &&
      query.amenities.length > 0
    ) {
      query.amenities.map((amenity: string, index: number) => {
        const param = `amenity${index}`;
        queryBuilder.andWhere(`property.amenities LIKE :${param}`, {
          [param]: `%${amenity}%`,
        });
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
