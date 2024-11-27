"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = createProperty;
exports.updateProperty = updateProperty;
exports.getProperty = getProperty;
exports.getProperties = getProperties;
const database_1 = require("../database");
const express_1 = __importDefault(require("express"));
const Property_1 = require("../entity/Property");
const propertyRouter = express_1.default.Router({ strict: true });
function createProperty(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const property = database_1.AppDataSource.manager.create(Property_1.Property, data);
        yield database_1.AppDataSource.manager.save(property);
        return property;
    });
}
function updateProperty(propertyId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const property = yield database_1.AppDataSource.manager.findOne(Property_1.Property, {
            where: { id: propertyId },
        });
        if (property) {
            Object.assign(property, data);
            yield database_1.AppDataSource.manager.save(property);
            return property;
        }
        return null;
    });
}
function getProperty(propertyId) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.AppDataSource.manager.findOne(Property_1.Property, {
            where: { id: propertyId },
            relations: ["agent"],
        });
    });
}
function getProperties() {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.AppDataSource.manager.find(Property_1.Property, { relations: ["agent"] });
    });
}
propertyRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const properties = yield getProperties();
    res.json(properties);
}));
propertyRouter.get("/:propertyId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const property = yield getProperty(req.params.propertyId);
    if (property)
        res.json(property);
    else
        res.status(404).send("Property not found");
}));
propertyRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        "agentId",
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
    const property = yield createProperty(req.body);
    res.json(property);
}));
propertyRouter.post("/query", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.body;
        let queryBuilder = database_1.AppDataSource.manager
            .createQueryBuilder(Property_1.Property, "property")
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
        if (query.saleableArea) {
            const { min, max } = query.saleableArea;
            if (min !== undefined && max !== undefined) {
                queryBuilder.andWhere("property.saleableArea BETWEEN :minArea AND :maxArea", { minArea: min, maxArea: max });
            }
            else if (min !== undefined) {
                queryBuilder.andWhere("property.saleableArea >= :minArea", {
                    minArea: min,
                });
            }
            else if (max !== undefined) {
                queryBuilder.andWhere("property.saleableArea <= :maxArea", {
                    maxArea: max,
                });
            }
        }
        if (query.netPrice) {
            const { min, max } = query.netPrice;
            if (min !== undefined && max !== undefined) {
                queryBuilder.andWhere("property.netPrice BETWEEN :minPrice AND :maxPrice", { minPrice: min, maxPrice: max });
            }
            else if (min !== undefined) {
                queryBuilder.andWhere("property.netPrice >= :minPrice", {
                    minPrice: min,
                });
            }
            else if (max !== undefined) {
                queryBuilder.andWhere("property.netPrice <= :maxPrice", {
                    maxPrice: max,
                });
            }
        }
        if (query.buildingAge) {
            const { min, max } = query.buildingAge;
            if (min !== undefined && max !== undefined) {
                queryBuilder.andWhere("property.buildingAge BETWEEN :minAge AND :maxAge", { minAge: min, maxAge: max });
            }
            else if (min !== undefined) {
                queryBuilder.andWhere("property.buildingAge >= :minAge", {
                    minAge: min,
                });
            }
            else if (max !== undefined) {
                queryBuilder.andWhere("property.buildingAge <= :maxAge", {
                    maxAge: max,
                });
            }
        }
        if (query.amenities &&
            Array.isArray(query.amenities) &&
            query.amenities.length > 0) {
            query.amenities.map((amenity, index) => {
                const param = `amenity${index}`;
                queryBuilder.andWhere(`property.amenities LIKE :${param}`, {
                    [param]: `%${amenity}%`,
                });
            });
        }
        const properties = yield queryBuilder.getMany();
        res.json(properties);
    }
    catch (error) {
        console.error("Error in property query:", error);
        res.status(500).send("An error occurred while querying properties");
    }
}));
propertyRouter.patch("/:propertyId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const property = yield updateProperty(req.params.propertyId, req.body);
    if (property)
        res.json(property);
    else
        res.status(404).send("Property not found");
}));
exports.default = propertyRouter;
