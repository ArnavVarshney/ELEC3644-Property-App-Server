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
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.getUser = getUser;
exports.getAgents = getAgents;
exports.getUsers = getUsers;
const database_1 = require("../database");
const express_1 = __importDefault(require("express"));
const User_1 = require("../entity/User");
const userRouter = express_1.default.Router({ strict: true });
function createUser(name, email, password, avatarUrl, phone) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield database_1.AppDataSource.manager.findOne(User_1.User, { where: { email: email } }))
            return;
        const user = new User_1.User();
        user.name = name;
        user.email = email;
        user.password = password;
        user.avatarUrl = avatarUrl !== null && avatarUrl !== void 0 ? avatarUrl : "";
        user.phone = phone !== null && phone !== void 0 ? phone : "";
        yield database_1.AppDataSource.manager.save(user);
        return user;
    });
}
function updateUser(userId, name, avatarUrl, phone) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield database_1.AppDataSource.manager.findOne(User_1.User, {
            where: { id: userId },
        });
        if (user) {
            user.name = name !== null && name !== void 0 ? name : user.name;
            user.avatarUrl = avatarUrl !== null && avatarUrl !== void 0 ? avatarUrl : user.avatarUrl;
            user.phone = phone !== null && phone !== void 0 ? phone : user.phone;
            yield database_1.AppDataSource.manager.save(user);
            return user;
        }
    });
}
function getUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.AppDataSource.manager.findOne(User_1.User, { where: { id: userId } });
    });
}
function getAgents() {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.AppDataSource.getRepository(User_1.User)
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.propertyListings", "property")
            .where("user.email LIKE :email", { email: "%.agents" })
            .select([
            "user.id",
            "user.name",
            "user.email",
            "user.phone",
            "user.avatarUrl",
            "user.createdAt",
            "property.id",
            "property.name",
        ])
            .getMany();
    });
}
function getUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.AppDataSource.manager.find(User_1.User);
    });
}
userRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getUsers());
}));
userRouter.get("/agents", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getAgents());
}));
userRouter.get("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const user = yield getUser(userId);
    if (user)
        res.json(user);
    else
        res.status(404).send("User not found");
}));
userRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, avatarUrl } = req.body;
    if (!name || !email || !password) {
        res.status(400).send("Name, email, and password are required");
        return;
    }
    const user = yield createUser(name, email, password, avatarUrl);
    if (!user)
        res.status(400).send("User creation failed");
    else {
        user.password = "";
        res.json(user);
    }
}));
userRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield database_1.AppDataSource.manager.findOne(User_1.User, {
        where: { email: email },
    });
    if (yield (user === null || user === void 0 ? void 0 : user.comparePassword(password)))
        res.json(user);
    else
        res.status(404).send("User not found");
}));
userRouter.patch("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const { name, avatarUrl } = req.body;
    const user = yield updateUser(userId, name, avatarUrl);
    if (user)
        res.json(user);
    else
        res.status(404).send("User not found");
}));
exports.default = userRouter;
