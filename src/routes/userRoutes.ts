import { AppDataSource } from "../database";
import express from "express";
import { User } from "../entity/User";
import { hash } from "bcrypt";
import nodemailer from "nodemailer";
import { transporter } from "../index";
import { getReviews } from "./reviewRoutes";

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

export async function resetPassword(id: string, newPassword: string) {
  const user = await AppDataSource.manager.findOne(User, {
    where: { id: id },
  });
  if (user) {
    user.password = await hash(newPassword, 10);
    await AppDataSource.manager.save(user);
    return user;
  }
}

export async function getUser(userId: string) {
  return AppDataSource.manager.findOne(User, { where: { id: userId } });
}

export async function getAgents() {
  var agents = await AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.propertyListings", "property")
    .leftJoinAndSelect("user.reviews", "review")
    .where("user.email LIKE :email", { email: "%agent%" })
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

  for (let i = 0; i < agents.length; i++) {
    const reviews = await getReviews(agents[i].id);
    agents[i].reviews = reviews;
  }

  return agents;
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

userRouter.post("/", async (req, res) => {
  const { name, email, phone, password, avatarUrl } = req.body;
  if (!name || !email || !password) {
    res.status(400).send("Name, email, and password are required");
    return;
  }

  if (await AppDataSource.manager.findOne(User, { where: { email: email } })) {
    res.status(400).send("Email already in use");
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

userRouter.post("/forgot-password", async (req, res) => {
  const email = req.body.email;
  const user = await AppDataSource.manager.findOne(User, {
    where: { email: email },
  });

  if (user) {
    const resetLink = `https://${req.get("host")}/abode/reset-password/${user.id}`;
    const mailOptions = {
      from: "info@home-nas.xyz",
      to: user.email,
      subject: "Password Reset",
      text: `Please use the following link to reset your password: ${resetLink}`,
      html: `<p>Please use the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    };

    transporter.sendMail(
      mailOptions,
      (error: any, info: { response: string }) => {
        if (error) {
          console.error(error);
          res.status(500).send("Error sending email");
        } else {
          console.log("Email sent: " + info.response);
          res.json(user);
        }
      },
    );
  } else {
    res.status(404).send("User not found");
  }
});

userRouter.post("/reset-password", async (req, res) => {
  const { id, newPassword } = req.body;
  const user = await resetPassword(id, newPassword);
  if (user) res.json(user);
  else res.status(404).send("User not found");
});

export default userRouter;
