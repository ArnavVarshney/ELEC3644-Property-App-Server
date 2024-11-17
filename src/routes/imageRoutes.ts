import express, { Request, Response } from "express";
import multer, { Multer, StorageEngine } from "multer";

const imageRouter = express.Router();
const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, "images/");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload: Multer = multer({ storage });

imageRouter.post(
  "",
  upload.single("image"),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).send("No file uploaded");
      return;
    }
    res.json({ filePath: `/images/${req.file.filename}` });
  },
);

export default imageRouter;
