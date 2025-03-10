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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.initDatabase = initDatabase;
require("reflect-metadata");
const User_1 = require("./entity/User");
const Message_1 = require("./entity/Message");
const Review_1 = require("./entity/Review");
const typeorm_1 = require("typeorm");
const Property_1 = require("./entity/Property");
const Wishlist_1 = require("./entity/Wishlist");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: "./chat.db",
    synchronize: true,
    logging: false,
    entities: [User_1.User, Message_1.Message, Review_1.Review, Property_1.Property, Wishlist_1.Wishlist],
});
function initDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exports.AppDataSource.initialize();
    });
}
