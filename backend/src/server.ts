// 完成版

// Express アプリの起動＋ルータ登録＋MongoDB接続＋Graceful Shutdown

import "dotenv/config";
import express from "express";
import { ENV } from "./config/env";
import postsRouter from "./api/posts";
import { connectDB, disconnectDB } from "./db/mongo";

const app = express();
app.use(express.json());

// MongoDB 接続してサーバー起動
(async () => {
  try {
    await connectDB(); // サーバー起動時に自動接続

    // 投稿 API ルータを登録
    app.use("/queue", postsRouter);

    // サーバー起動
    const server = app.listen(ENV.PORT, () => {
      console.log(`Server running on http://localhost:${ENV.PORT}`);
    });

    // サーバー終了時のクリーンアップ
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} 受信 → サーバーを停止します...`);
      server.close(async () => {
        console.log("HTTP サーバー停止完了");
        await disconnectDB(); // ここでDB(Atlas)切断
        process.exit(0);
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT (Ctrl+C)"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (err) {
    console.error("DB接続失敗！", err);
    process.exit(1);
  }
})();
