import { AppDataSource } from "../database";
import express from "express";
import { User } from "../entity/User";

const userRouter = express.Router({ strict: true });

export async function createUser(
  name: string,
  email: string,
  password: string,
  avatarUrl?: string,
) {
  if (await AppDataSource.manager.findOne(User, { where: { email: email } }))
    return;
  const user = new User();
  user.name = name;
  user.email = email;
  user.password = password;
  user.avatarUrl = avatarUrl ?? "";
  await AppDataSource.manager.save(user);
  return user;
}

export async function updateUser(
  userId: string,
  name?: string,
  avatarUrl?: string,
) {
  const user = await AppDataSource.manager.findOne(User, {
    where: { id: userId },
  });
  if (user) {
    user.name = name ?? user.name;
    user.avatarUrl = avatarUrl ?? user.avatarUrl;
    await AppDataSource.manager.save(user);
    return user;
  }
}

export async function getUser(userId: string) {
  return AppDataSource.manager.findOne(User, { where: { id: userId } });
}

export async function getUsers() {
  return AppDataSource.manager.find(User);
}

userRouter.get("/", async (req, res) => {
  res.json(await getUsers());
});

userRouter.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const user = await getUser(userId);
  if (user) res.json(user);
  else res.status(404).send("User not found");
});

userRouter.post("/", async (req, res) => {
  const { name, email, password, avatarUrl } = req.body;
  if (!name || !email || !password) {
    res.status(400).send("Name, email, and password are required");
    return;
  }
  const user = await createUser(name, email, password, avatarUrl);
  if (!user) res.status(400).send("User creation failed");
  else {
    user.password = "";
    res.json(user);
  }
});

userRouter.patch("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { name, avatarUrl } = req.body;
  const user = await updateUser(userId, name, avatarUrl);
  if (user) res.json(user);
  else res.status(404).send("User not found");
});

export default userRouter;
