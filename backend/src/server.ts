import "dotenv/config";
import express from "express";
import { ENV } from "./config/env";
import { connectDB } from "./db/mongo";

const app = express();
app.use(express.json());

// MongoDB 接続テスト
connectDB().catch((err) => {
  console.error("DB接続失敗！", err);
  process.exit(1);
});

// デバッグログ
console.log("ENV.MONGODB_URI:", ENV.MONGODB_URI);

// ↓API群↓

// 投稿を保存する API
app.post("/queue", async (req, res) => {
  const db = await connectDB();
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
  const db = await connectDB();
  const stores = await db.collection("stores").find({}).toArray();
  res.json(stores);
});

// 店舗ごとの過去投稿取得 API
app.get("/queue/:storeId", async (req, res) => {
  const db = await connectDB();
  const { storeId } = req.params;

  const posts = await db
    .collection("queues")
    .find({ storeId })
    .sort({ createdAt: -1 })
    .toArray();

  res.json(posts);
});

app.listen(ENV.PORT, () => {
  console.log(`Server running on http://localhost:${ENV.PORT}`);
});
