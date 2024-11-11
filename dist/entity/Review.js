"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Property_1 = require("./Property");
let Review = class Review {
    constructor() {
        this.timestamp = new Date();
    }
};
exports.Review = Review;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Review.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Review.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 2, scale: 1 }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Review.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Property_1.Property, (property) => property.reviews),
    __metadata("design:type", Property_1.Property)
], Review.prototype, "reviewedProperty", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.reviews),
    __metadata("design:type", User_1.User)
], Review.prototype, "reviewedUser", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Review.prototype, "timestamp", void 0);
exports.Review = Review = __decorate([
    (0, typeorm_1.Entity)()
], Review);
