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
exports.createReview = createReview;
exports.getReview = getReview;
exports.getReviews = getReviews;
const database_1 = require("../database");
const express_1 = __importDefault(require("express"));
const Review_1 = require("../entity/Review");
const User_1 = require("../entity/User");
const Property_1 = require("../entity/Property");
const reviewRouter = express_1.default.Router({ strict: true });
function createReview(authorId, rating, content, reviewedUserId, reviewedPropertyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const review = new Review_1.Review();
        const author = yield database_1.AppDataSource.manager.findOne(User_1.User, {
            where: { id: authorId },
        });
        if (!author)
            return;
        if (reviewedUserId) {
            const user = yield database_1.AppDataSource.manager.findOne(User_1.User, {
                where: { id: reviewedUserId },
            });
            console.log(user);
            if (user)
                review.reviewedUser = user;
        }
        else if (reviewedPropertyId) {
            const property = yield database_1.AppDataSource.manager.findOne(Property_1.Property, {
                where: { id: reviewedPropertyId },
            });
            if (property)
                review.reviewedProperty = property;
        }
        review.author = author;
        review.rating = rating;
        review.content = content;
        yield database_1.AppDataSource.manager.save(review);
        return review;
    });
}
function getReview(reviewId) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.AppDataSource.manager.findOne(Review_1.Review, {
            where: { id: reviewId },
            relations: ['author', 'reviewedUser', 'reviewedProperty']
        });
    });
}
function getReviews(userId, propertyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const reviewRepository = database_1.AppDataSource.getRepository(Review_1.Review);
        let whereClause = {};
        if (userId) {
            whereClause = { reviewedUser: { id: userId } };
        }
        else if (propertyId) {
            whereClause = { reviewedProperty: { id: propertyId } };
        }
        return reviewRepository.find({
            where: whereClause,
            relations: ['author', 'reviewedUser', 'reviewedProperty']
        });
    });
}
reviewRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getReviews());
}));
reviewRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewId = req.params.id;
    const review = yield getReview(reviewId);
    if (review)
        res.json(review);
    else
        res.status(404).send("Review not found");
}));
reviewRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorId, rating, content, reviewedUserId, reviewedPropertyId } = req.body;
    if (!authorId || !rating || !content) {
        res.status(400).send("Author ID, rating, and content are required");
        return;
    }
    const review = yield createReview(authorId, rating, content, reviewedUserId, reviewedPropertyId);
    if (review)
        res.json(review);
    else
        res.status(400).send("Failed to create review");
}));
exports.default = reviewRouter;
