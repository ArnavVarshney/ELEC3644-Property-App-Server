import { AppDataSource } from "../database";
import express from "express";
import { User } from "../entity/User";
import { hash } from "bcrypt";

const userRouter = express.Router({ strict: true });

export async function createUser(
  name: string,
  email: string,
  password: string,
  avatarUrl?: string,
  phone?: string,
) {
  if (await AppDataSource.manager.findOne(User, { where: { email: email } }))
    return;
  const user = new User();
  user.name = name;
  user.email = email;
  user.password = password;
  user.avatarUrl = avatarUrl ?? "";
  user.phone = phone ?? "";
  await AppDataSource.manager.save(user);
  return user;
}

export async function updateUser(
  userId: string,
  name?: string,
  avatarUrl?: string,
  phone?: string,
  isActive?: string,
  oldPassword?: string,
  newPassword?: string,
) {
  const user = await AppDataSource.manager.findOne(User, {
    where: { id: userId },
  });
  if (user) {
    user.name = name ?? user.name;
    user.avatarUrl = avatarUrl ?? user.avatarUrl;
    user.phone = phone ?? user.phone;
    if (isActive) user.isActive = isActive != "false";
    if (oldPassword && newPassword)
      if (await user.comparePassword(oldPassword))
        user.password = await hash(newPassword, 10);
      else return null;
    await AppDataSource.manager.save(user);
    return user;
  }
}

export async function getUser(userId: string) {
  return AppDataSource.manager.findOne(User, { where: { id: userId } });
}

export async function getAgents() {
  return AppDataSource.getRepository(User)
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
}

export async function getUsers() {
  return AppDataSource.manager.find(User);
}

userRouter.get("/", async (req, res) => {
  res.json(await getUsers());
});

userRouter.get("/agents", async (req, res) => {
  res.json(await getAgents());
});

userRouter.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const user = await getUser(userId);
  if (user) res.json(user);
  else res.status(404).send("User not found");
});

userRouter.get("/exists/:email", async (req, res) => {
  const email = req.params.email;
  const user = await AppDataSource.manager.findOne(User, {
    where: { email: email },
  });
  if (user) res.json({ exists: true });
  else res.json({ exists: false });
});

userRouter.post("/", async (req, res) => {
  const { name, email, phone, password, avatarUrl } = req.body;
  if (!name || !email || !password) {
    res.status(400).send("Name, email, and password are required");
    return;
  }
  const user = await createUser(name, email, password, avatarUrl, phone);
  if (!user) res.status(400).send("User creation failed");
  else {
    user.password = "";
    res.json(user);
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await AppDataSource.manager.findOne(User, {
    where: { email: email, isActive: true },
  });
  if (await user?.comparePassword(password)) res.json(user);
  else res.status(404).send("User not found");
});

userRouter.patch("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { name, avatarUrl, isActive, phone, oldPassword, newPassword } =
    req.body;
  const user = await updateUser(
    userId,
    name,
    avatarUrl,
    phone,
    isActive,
    oldPassword,
    newPassword,
  );
  if (user) res.json(user);
  else res.status(404).send("User not found");
});

export default userRouter;
