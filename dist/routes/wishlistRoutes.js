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
exports.addWishlist = addWishlist;
exports.removeWishlist = removeWishlist;
exports.getWishlists = getWishlists;
exports.getWishlistsFolderName = getWishlistsFolderName;
exports.getAllWishlists = getAllWishlists;
const database_1 = require("../database");
const express_1 = __importDefault(require("express"));
const Wishlist_1 = require("../entity/Wishlist");
const propertyRoutes_1 = require("./propertyRoutes");
const userRoutes_1 = require("./userRoutes");
const wishlistRouter = express_1.default.Router({ strict: true });
function addWishlist(userId, propertyId, folderName) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (0, userRoutes_1.getUser)(userId);
        const property = yield (0, propertyRoutes_1.getProperty)(propertyId);
        if (user === null || property === null) {
            return null;
        }
        let wishlist = new Wishlist_1.Wishlist();
        wishlist.folderName = folderName;
        wishlist.userId = userId;
        wishlist.propertyId = propertyId;
        const res = yield database_1.AppDataSource.manager.save(wishlist);
        return res;
    });
}
function removeWishlist(userId, propertyId, folderName) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield database_1.AppDataSource.manager.delete(Wishlist_1.Wishlist, { userId: userId, propertyId: propertyId, folderName: folderName });
        return res;
    });
}
function getWishlists(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield database_1.AppDataSource.manager.find(Wishlist_1.Wishlist, { where: { userId: userId } });
        return res;
    });
}
function getWishlistsFolderName(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield database_1.AppDataSource.manager.createQueryBuilder(Wishlist_1.Wishlist, "W").select("W.folderName").where("W.userId = :userId", { userId: userId }).distinct(true).getMany();
        return res;
    });
}
function getAllWishlists() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield database_1.AppDataSource.manager.find(Wishlist_1.Wishlist);
        return res;
    });
}
wishlistRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getAllWishlists());
}));
wishlistRouter.get("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const result = yield getWishlists(userId);
    const folderNames = yield getWishlistsFolderName(userId);
    //Initialisation
    let favorites = {};
    for (const w of folderNames) {
        let name = w.folderName;
        favorites[name] = [];
    }
    for (const row of result) {
        let folderName = row.folderName;
        let property = yield (0, propertyRoutes_1.getProperty)(row.propertyId);
        if (property === null) {
            continue;
        }
        favorites[folderName].push(property);
    }
    res.json(favorites);
}));
wishlistRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, propertyId, folderName } = req.body;
    const wishlist = yield addWishlist(userId, propertyId, folderName);
    if (wishlist)
        res.json(wishlist);
    else
        res.status(500).send({ "message": "Something bad happened. Either no property or no user, or both" });
}));
wishlistRouter.delete("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, propertyId, folderName } = req.body;
    const wishlist = yield removeWishlist(userId, propertyId, folderName);
    if (wishlist)
        res.json(wishlist);
    else
        res.status(500).send({ "message": "Something bad happened" });
}));
exports.default = wishlistRouter;
