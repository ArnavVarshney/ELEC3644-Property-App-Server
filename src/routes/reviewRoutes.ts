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
  userId?: string,
  propertyId?: string,
) {
  const review = new Review();
  const author = await AppDataSource.manager.findOne(User, {
    where: { id: authorId },
  });
  if (!author) return;
  if (userId) {
    const user = await AppDataSource.manager.findOne(User, {
      where: { id: userId },
    });
    if (user) review.reviewedUser = user;
  } else if (propertyId) {
    const property = await AppDataSource.manager.findOne(Property, {
      where: { id: propertyId },
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
  return AppDataSource.manager.findOne(Review, { where: { id: reviewId } });
}

export async function getReviews(userId?: string, propertyId?: string) {
  const reviewRepository = AppDataSource.getRepository(Review);
  return reviewRepository.find({
    where: [
      { reviewedUser: { id: userId } },
      { reviewedProperty: { id: propertyId } },
    ],
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

reviewRouter.post("/", async (req, res) => {
  const { authorId, rating, content, userId, propertyId } = req.body;
  if (!authorId || !rating || !content) {
    res.status(400).send("Author ID, rating, and content are required");
    return;
  }

  const review = await createReview(
    authorId,
    rating,
    content,
    userId,
    propertyId,
  );
  if (review) res.json(review);
  else res.status(400).send("Failed to create review");
});

export default reviewRouter;
