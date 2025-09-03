"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const mongo_1 = require("./db/mongo");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// MongoDB 接続テスト
(0, mongo_1.connectDB)().catch((err) => {
    console.error("DB接続失敗！", err);
    process.exit(1);
});
// デバッグログ
console.log("ENV.MONGODB_URI:", env_1.ENV.MONGODB_URI);
// ↓API群↓
// 投稿を保存する API
app.post("/queue", async (req, res) => {
    const db = await (0, mongo_1.connectDB)();
    const { storeId, waitTime } = req.body;
    if (!storeId || !waitTime)
        return res.status(400).json({ error: "Missing fields" });
    const collection = db.collection("queues");
    const result = await collection.insertOne({
        storeId,
        waitTime,
        createdAt: new Date(),
    });
    res.json({ insertedId: result.insertedId });
});
// 店舗一覧取得 API
app.get("/stores", async (_req, res) => {
    const db = await (0, mongo_1.connectDB)();
    const stores = await db.collection("stores").find({}).toArray();
    res.json(stores);
});
// 店舗ごとの過去投稿取得 API
app.get("/queue/:storeId", async (req, res) => {
    const db = await (0, mongo_1.connectDB)();
    const { storeId } = req.params;
    const posts = await db
        .collection("queues")
        .find({ storeId })
        .sort({ createdAt: -1 })
        .toArray();
    res.json(posts);
});
app.listen(env_1.ENV.PORT, () => {
    console.log(`Server running on http://localhost:${env_1.ENV.PORT}`);
});
//# sourceMappingURL=server.js.map