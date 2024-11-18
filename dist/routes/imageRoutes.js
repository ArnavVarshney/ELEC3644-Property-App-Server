"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const imageRouter = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
imageRouter.post("/", upload.single("file"), (req, res) => {
    if (!req.file) {
        res.status(400).send("No file uploaded");
        return;
    }
    const fullUrl = `https://${req.get("host")}/images/${req.file.filename}`;
    res.json({ url: fullUrl });
});
exports.default = imageRouter;
