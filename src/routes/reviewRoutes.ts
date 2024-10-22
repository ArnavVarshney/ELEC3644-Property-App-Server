import { AppDataSource } from "../database";
import express from "express";
import { Review } from "../entity/Review";
import { User } from "../entity/User";
import { Property } from "../entity/Property";

const reviewRouter = express.Router({ strict: true });

export async function createReview(
  authorId: string,
  rating: number,
  content: string,
  reviewedUserId?: string,
  reviewedPropertyId?: string,
) {
  const review = new Review();
  const author = await AppDataSource.manager.findOne(User, {
    where: { id: authorId },
  });
  if (!author) return;
  if (reviewedUserId) {
    const user = await AppDataSource.manager.findOne(User, {
      where: { id: reviewedUserId },
    });
    console.log(user);
    if (user) review.reviewedUser = user;
  } else if (reviewedPropertyId) {
    const property = await AppDataSource.manager.findOne(Property, {
      where: { id: reviewedPropertyId },
    });
    if (property) review.reviewedProperty = property;
  }
  review.author = author;
  review.rating = rating;
  review.content = content;
  await AppDataSource.manager.save(review);
  return review;
}

export async function getReview(reviewId: string) {
  return AppDataSource.manager.findOne(Review, {
    where: { id: reviewId },
    relations: ['author', 'reviewedUser', 'reviewedProperty']
  });
}

export async function getReviews(userId?: string, propertyId?: string) {
  const reviewRepository = AppDataSource.getRepository(Review);
  let whereClause = {};

  if (userId) {
    whereClause = { reviewedUser: { id: userId } };
  } else if (propertyId) {
    whereClause = { reviewedProperty: { id: propertyId } };
  }

  return reviewRepository.find({
    where: whereClause,
    relations: ['author', 'reviewedUser', 'reviewedProperty']
  });
}

reviewRouter.get("/", async (req, res) => {
  res.json(await getReviews());
});

reviewRouter.get("/:id", async (req, res) => {
  const reviewId = req.params.id;
  const review = await getReview(reviewId);
  if (review) res.json(review);
  else res.status(404).send("Review not found");
});

reviewRouter.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const reviews = await getReviews(userId);
  if (reviews) res.json(reviews);
  else res.status(404).send("Reviews not found");
});

reviewRouter.get("/property/:propertyId", async (req, res) => {
  const propertyId = req.params.propertyId;
  const reviews = await getReviews(undefined, propertyId);
  if (reviews) res.json(reviews);
  else res.status(404).send("Reviews not found");
});

reviewRouter.post("/", async (req, res) => {
  const { authorId, rating, content, reviewedUserId, reviewedPropertyId } =
    req.body;
  if (!authorId || !rating || !content) {
    res.status(400).send("Author ID, rating, and content are required");
    return;
  }

  const review = await createReview(
    authorId,
    rating,
    content,
    reviewedUserId,
    reviewedPropertyId,
  );
  if (review) res.json(review);
  else res.status(400).send("Failed to create review");
});

export default reviewRouter;
