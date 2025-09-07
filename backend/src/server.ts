// 完成版

// Express アプリの起動＋ルータ登録のみ行う

import "dotenv/config";
import express from "express";
import { ENV } from "./config/env";
import postsRouter from "./api/posts";

const app = express();
app.use(express.json());

// 投稿 API ルータを登録
app.use("/queue", postsRouter);

// サーバー起動
app.listen(ENV.PORT, () => {
  console.log(`Server running on http://localhost:${ENV.PORT}`);
});
