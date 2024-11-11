import express from "express";
import * as http from "http";
import dotenv from "dotenv";
import WebSocket from "ws";
import { initDatabase } from "./database";
import { handleWS } from "./websocket";
import simpleGit from "simple-git";

import userRouter from "./routes/userRoutes";
import messageRouter from "./routes/messageRoutes";
import reviewRouter from "./routes/reviewRoutes";
import propertyRouter from "./routes/propertyRoutes";
import wishlistRouter from "./routes/wishlistRoutes"

dotenv.config();

const app = express();
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

initDatabase();

wss.on("connection", handleWS);

const port = process.env.PORT || 6969;

app.get("/", async (req, res) => {
  const git = simpleGit();
  try {
    const log = await git.log();
    const latestCommit = log.latest;
    const commitDate = latestCommit?.date
      ? new Date(latestCommit.date).toLocaleString("en-HK", {
          timeZone: "Asia/Hong_Kong",
        })
      : "Unknown date";
    const commitUrl = `https://github.com/ArnavVarshney/ELEC3644-Property-App-Server/commit/${latestCommit?.hash}`;
    res.send(`
            <h1>Latest Commit</h1>
            <p><strong>Hash:</strong> <a href="${commitUrl}" target="_blank">${latestCommit?.hash}</a></p>
            <p><strong>Message:</strong> ${latestCommit?.message}</p>
            <p><strong>Date:</strong> ${commitDate}</p>
        `);
  } catch (error) {
    res.status(500).send("Error fetching latest commit");
  }
});

app.use("/users", userRouter);
app.use("/messages", messageRouter);
app.use("/reviews", reviewRouter);
app.use("/properties", propertyRouter);
app.use("/wishlists", wishlistRouter)
app.use("/images", express.static("images", { maxAge: "1h" }));

server.listen(port, () => {
  console.log(`Server running at port http://localhost:${port}`);
});
