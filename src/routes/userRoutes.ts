import { AppDataSource } from "../database";
import express from "express";
import { User } from "../entity/User";
import { Like } from "typeorm";
import { Wishlist } from "../entity/Wishlist";
import { Property } from "../entity/Property";

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

export async function getAgents() {
  return AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.propertyListings", "property")
    .where("user.email LIKE :email", { email: "%.agents" })
    .select([
      "user.id",
      "user.name",
      "user.email",
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

export async function addWishlist(
  userId: string,
  propertyId: string,
  folderName: string,
) {
  const wishlist = new Wishlist();
  const user = await AppDataSource.manager.findOneBy(User,  { id : userId })
  const property = await AppDataSource.manager.findOneBy(Property, { id: propertyId })

  wishlist.folderName = folderName
  wishlist.user = user!
  wishlist.property = property!

  await AppDataSource.manager.save(wishlist);
  return user;
}

export async function removeWishlist(
  userId: string,
  propertyId: string,
  folderName: string,
) {
  const res = await AppDataSource.manager.delete(Wishlist, { user: userId, property: propertyId, folderName: folderName })
  return res;
}

export async function getWishlists(
  userId: string
) {
  const res = await AppDataSource.manager.query(`SELECT * FROM WISHLIST WHERE user='${userId}'`)
  return res;
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

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await AppDataSource.manager.findOne(User, {
    where: { email: email },
  });
  if (await user?.comparePassword(password)) res.json(user);
  else res.status(404).send("User not found");
});

userRouter.patch("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { name, avatarUrl } = req.body;
  const user = await updateUser(userId, name, avatarUrl);
  if (user) res.json(user);
  else res.status(404).send("User not found");
});

export default userRouter;
