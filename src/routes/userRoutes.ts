import * as db from "../database";
import express from "express";

const userRouter = express.Router({ strict: true });

userRouter.get("/", async (req, res) => {
  res.json(await db.getUsers());
});

userRouter.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const user = await db.getUser(userId);
  if (user) res.json(user);
  else res.status(404).send("User not found");
});

userRouter.post("/", async (req, res) => {
  const { name, email, password, avatarUrl } = req.body;
  if (!name || !email || !password) {
    res.status(400).send("Name, email, and password are required");
    return;
  }
  const user = await db.createUser(name, email, password, avatarUrl);
  res.json(user);
});

userRouter.patch("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { name, avatarUrl } = req.body;
  const user = await db.updateUser(userId, name, avatarUrl);
  if (user) res.json(user);
  else res.status(404).send("User not found");
});

export default userRouter;
