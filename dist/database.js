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
exports.createUpdateUser = createUpdateUser;
exports.getUser = getUser;
exports.saveMessage = saveMessage;
exports.getMessages = getMessages;
require("reflect-metadata");
const User_1 = require("./entity/User");
const Message_1 = require("./entity/Message");
const Group_1 = require("./entity/Group");
const Review_1 = require("./entity/Review");
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: "./chat.db",
    synchronize: true,
    logging: true,
    entities: [User_1.User, Message_1.Message, Group_1.Group, Review_1.Review],
});
function initDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exports.AppDataSource.initialize();
    });
}
function createUpdateUser(name, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = new User_1.User();
        if (id)
            user.id = id;
        user.name = name;
        yield exports.AppDataSource.manager.save(user);
        return user;
    });
}
function getUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return exports.AppDataSource.manager.findOne(User_1.User, { where: { id: userId } });
    });
}
function saveMessage(senderId, receiverId, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = new Message_1.Message();
        const sender = yield exports.AppDataSource.manager.findOne(User_1.User, { where: { id: senderId } });
        const receiver = yield exports.AppDataSource.manager.findOne(User_1.User, { where: { id: receiverId } });
        if (sender && receiver) {
            message.sender = sender;
            message.receiver = receiver;
            message.content = content;
            yield exports.AppDataSource.manager.save(message);
            return message;
        }
    });
}
function getMessages(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const messageRepository = exports.AppDataSource.getRepository(Message_1.Message);
        return messageRepository.find({
            where: [
                { sender: { id: userId } },
                { receiver: { id: userId } }
            ]
        });
    });
}
