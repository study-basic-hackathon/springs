"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const mongo_1 = require("../db/mongo");
const router = (0, express_1.Router)();
/**
 * 投稿を保存する API
 */
router.post("/", async (req, res) => {
    const db = await (0, mongo_1.connectDB)();
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
    // ✅ ステータスコード 201 Created (新規作成成功)
    return res.status(201).json({
        insertedId: result.insertedId,
        createdAt,
        expiresAt,
    });
});
// テストホゲホゲ
router.get("/hogehoge", async (_req, res) => {
    res.json({ hogehoge: "fugafuga" });
});
/**
 * 特定店舗の投稿一覧取得
 */
router.get("/:placeId", async (req, res) => {
    const db = await (0, mongo_1.connectDB)();
    const { placeId } = req.params;
    const now = new Date();
    const posts = await db
        .collection("queues")
        .find({ placeId })
        .sort({ createdAt: -1 })
        .toArray();
    // ✅ 投稿ゼロなら 404
    if (!posts || posts.length === 0) {
        return res.status(404).json({ error: "指定された店舗の投稿はありません" });
    }
    const formattedPosts = posts.map((post) => ({
        ...post,
        isActive: post.expiresAt > now,
    }));
    res.json(formattedPosts);
});
/**
 * 全投稿一覧取得
 */
router.get("/", async (_req, res) => {
    const db = await (0, mongo_1.connectDB)();
    const now = new Date();
    const posts = await db.collection("queues").find({}).toArray();
    const formattedPosts = posts.map((post) => ({
        ...post,
        isActive: post.expiresAt > now,
    }));
    res.json(formattedPosts);
});
/**
 * 投稿削除 API
 */
router.delete("/:id", async (req, res) => {
    const db = await (0, mongo_1.connectDB)();
    const { id } = req.params;
    try {
        const result = await db.collection("queues").deleteOne({
            _id: new mongodb_1.ObjectId(id),
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "指定された投稿は存在しません" });
        }
        return res.status(200).json({ message: "削除しました", id });
    }
    catch (err) {
        return res.status(400).json({ error: "無効なIDです" });
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map