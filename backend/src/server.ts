import "dotenv/config";
import express from "express";
import cors from "cors";
import { ENV } from "./config/env";
import { connectDB } from "./utils/db";

const app = express();
app.use(cors());
app.use(express.json());

// 疎通確認用エンドポイント
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    message: "server running",
    ts: new Date().toISOString(),
  });
});

(async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`[server] http://localhost:${ENV.PORT}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
