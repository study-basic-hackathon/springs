// 完成版？おそらくこれ以上編集不要

// 環境変数を TypeScript で扱いやすくするためのラッパー
import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  PORT: Number(process.env.PORT ?? 3000),
};
