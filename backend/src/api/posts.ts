// 完成版

// バックエンドは CRUD の C(作成) と R(取得) に絞って最小実装
// JSON ボディの必須項目チェックも入れて、親切仕様 ← ？
// 投稿保存時に expiresAt(有効期限) を自動追加　(1時間経ったらisActive = false)
// 投稿取得時に isActive を判定して返す　→ フロントで色分けを実装しやすくした

import { Router } from "express";
import { connectDB } from "../db/mongo";

const router = Router();

/**
 * 投稿を保存する API
 * フロントから受け取る JSON:
 * {
 *   placeId: string,  // Google Maps Place ID
 *   waitTime: number, // 待ち時間（分）
 *   comment?: string  // 任意コメント
 * }
 * 自動で createdAt と expiresAt（1時間後）を追加
 */
router.post("/", async (req, res) => {
  const db = await connectDB();
  const { placeId, waitTime, comment } = req.body;

  if (!placeId || !waitTime) {
    return res.status(400).json({ error: "placeId と waitTime が必要です" });
  }

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000);

  const result = await db.collection("queues").insertOne({
    placeId,
    waitTime,
    comment: comment || "",
    createdAt,
    expiresAt,
  });

  res.json({ insertedId: result.insertedId, createdAt, expiresAt });
});

/**
 * 特定店舗の投稿一覧取得
 * placeId パラメータに対応
 * isActive を付与 → フロントで色分け可能
 */
router.get("/:placeId", async (req, res) => {
  const db = await connectDB();
  const { placeId } = req.params;
  const now = new Date();

  const posts = await db
    .collection("queues")
    .find({ placeId })
    .sort({ createdAt: -1 })
    .toArray();

  const formattedPosts = posts.map((post) => ({
    ...post,
    isActive: post.expiresAt > now,
  }));

  res.json(formattedPosts);
});

/**
 * 全投稿一覧取得（フロントモック用）
 * ピンに対してまとめて表示する際に便利
 */
router.get("/", async (_req, res) => {
  const db = await connectDB();
  const now = new Date();

  const posts = await db.collection("queues").find({}).toArray();
  const formattedPosts = posts.map((post) => ({
    ...post,
    isActive: post.expiresAt > now,
  }));

  res.json(formattedPosts);
});

export default router;
