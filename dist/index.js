"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const ws_1 = __importDefault(require("ws"));
const database_1 = require("./database");
const websocket_1 = require("./websocket");
const simple_git_1 = __importDefault(require("simple-git"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http.createServer(app);
const wss = new ws_1.default.Server({ server });
(0, database_1.initDatabase)();
wss.on("connection", websocket_1.handleWS);
const port = process.env.PORT || 6969;
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const git = (0, simple_git_1.default)();
    try {
        const log = yield git.log();
        const latestCommit = log.latest;
        const commitDate = (latestCommit === null || latestCommit === void 0 ? void 0 : latestCommit.date) ? new Date(latestCommit.date).toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' }) : 'Unknown date';
        const commitUrl = `https://github.com/ArnavVarshney/ELEC3644-Property-App-Server/commit/${latestCommit === null || latestCommit === void 0 ? void 0 : latestCommit.hash}`;
        res.send(`
            <h1>Latest Commit</h1>
            <p><strong>Hash:</strong> <a href="${commitUrl}" target="_blank">${latestCommit === null || latestCommit === void 0 ? void 0 : latestCommit.hash}</a></p>
            <p><strong>Message:</strong> ${latestCommit === null || latestCommit === void 0 ? void 0 : latestCommit.message}</p>
            <p><strong>Date:</strong> ${commitDate}</p>
        `);
    }
    catch (error) {
        res.status(500).send('Error fetching latest commit');
    }
}));
app.use('/users', userRoutes_1.default);
server.listen(port, () => {
    console.log(`Server running at port http://localhost:${port}`);
});
