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
function createProperty(name, address, area, district, subDistrict, facilities, schoolNet, saleableArea, saleableAreaPricePerSquareFoot, grossFloorArea, grossFloorAreaPricePerSquareFoot, netPrice, buildingAge, buildingDirection, estate, imageUrls, transactionHistory) {
    return __awaiter(this, void 0, void 0, function* () {
        const property = new Property_1.Property();
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
        property.imageUrls = imageUrls !== null && imageUrls !== void 0 ? imageUrls : [];
        property.transactionHistory = transactionHistory !== null && transactionHistory !== void 0 ? transactionHistory : [];
        yield database_1.AppDataSource.manager.save(property);
        return property;
    });
}
function updateProperty(propertyId, name, address, area, district, subDistrict, facilities, schoolNet, saleableArea, saleableAreaPricePerSquareFoot, grossFloorArea, grossFloorAreaPricePerSquareFoot, netPrice, buildingAge, buildingDirection, estate, imageUrls, transactionHistory) {
    return __awaiter(this, void 0, void 0, function* () {
        const property = yield database_1.AppDataSource.manager.findOne(Property_1.Property, {
            where: { id: propertyId },
        });
        if (property) {
            property.name = name !== null && name !== void 0 ? name : property.name;
            property.address = address !== null && address !== void 0 ? address : property.address;
            property.area = area !== null && area !== void 0 ? area : property.area;
            property.district = district !== null && district !== void 0 ? district : property.district;
            property.subDistrict = subDistrict !== null && subDistrict !== void 0 ? subDistrict : property.subDistrict;
            property.facilities = facilities !== null && facilities !== void 0 ? facilities : property.facilities;
            property.schoolNet = schoolNet !== null && schoolNet !== void 0 ? schoolNet : property.schoolNet;
            property.saleableArea = saleableArea !== null && saleableArea !== void 0 ? saleableArea : property.saleableArea;
            property.saleableAreaPricePerSquareFoot =
                saleableAreaPricePerSquareFoot !== null && saleableAreaPricePerSquareFoot !== void 0 ? saleableAreaPricePerSquareFoot : property.saleableAreaPricePerSquareFoot;
            property.grossFloorArea = grossFloorArea !== null && grossFloorArea !== void 0 ? grossFloorArea : property.grossFloorArea;
            property.grossFloorAreaPricePerSquareFoot =
                grossFloorAreaPricePerSquareFoot !== null && grossFloorAreaPricePerSquareFoot !== void 0 ? grossFloorAreaPricePerSquareFoot : property.grossFloorAreaPricePerSquareFoot;
            property.netPrice = netPrice !== null && netPrice !== void 0 ? netPrice : property.netPrice;
            property.buildingAge = buildingAge !== null && buildingAge !== void 0 ? buildingAge : property.buildingAge;
            property.buildingDirection =
                buildingDirection !== null && buildingDirection !== void 0 ? buildingDirection : property.buildingDirection;
            property.estate = estate !== null && estate !== void 0 ? estate : property.estate;
            property.imageUrls = imageUrls !== null && imageUrls !== void 0 ? imageUrls : property.imageUrls;
            property.transactionHistory =
                transactionHistory !== null && transactionHistory !== void 0 ? transactionHistory : property.transactionHistory;
            yield database_1.AppDataSource.manager.save(property);
            return property;
        }
    });
}
function getProperty(propertyId) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.AppDataSource.manager.findOne(Property_1.Property, { where: { id: propertyId } });
    });
}
function getProperties() {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.AppDataSource.manager.find(Property_1.Property);
    });
}
propertyRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getProperties());
}));
propertyRouter.get("/:propertyId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyId = req.params.propertyId;
    const property = yield getProperty(propertyId);
    if (property)
        res.json(property);
    else
        res.status(404).send("Property not found");
}));
propertyRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, area, district, subDistrict, facilities, schoolNet, saleableArea, saleableAreaPricePerSquareFoot, grossFloorArea, grossFloorAreaPricePerSquareFoot, netPrice, buildingAge, buildingDirection, estate, imageUrls, transactionHistory, } = req.body;
    if (!name ||
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
        !estate) {
        res.status(400).send("All fields are required");
        return;
    }
    const property = yield createProperty(name, address, area, district, subDistrict, facilities, schoolNet, saleableArea, saleableAreaPricePerSquareFoot, grossFloorArea, grossFloorAreaPricePerSquareFoot, netPrice, buildingAge, buildingDirection, estate, imageUrls, transactionHistory);
    res.json(property);
}));
propertyRouter.patch("/:propertyId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyId = req.params.propertyId;
    const { name, address, area, district, subDistrict, facilities, schoolNet, saleableArea, saleableAreaPricePerSquareFoot, grossFloorArea, grossFloorAreaPricePerSquareFoot, netPrice, buildingAge, buildingDirection, estate, imageUrls, transactionHistory, } = req.body;
    const property = yield updateProperty(propertyId, name, address, area, district, subDistrict, facilities, schoolNet, saleableArea, saleableAreaPricePerSquareFoot, grossFloorArea, grossFloorAreaPricePerSquareFoot, netPrice, buildingAge, buildingDirection, estate, imageUrls, transactionHistory);
    if (property)
        res.json(property);
    else
        res.status(404).send("Property not found");
}));
exports.default = propertyRouter;
