// 完成版

// connectDB() で Atlas のデフォルト DB に接続
// disconnectDB() で切断
// テスト実行も if (require.main === module) 部分で簡単にできる

import { MongoClient, ServerApiVersion, Db } from "mongodb";
import { ENV } from "../config/env";

// MongoDB クライアントと DB を格納する変数
let client: MongoClient;
let db: Db;

/**
 * MongoDB に接続する関数
 * 他のファイルから呼び出して使う
 */
export async function connectDB(): Promise<Db> {
  // すでに接続済みなら再利用
  if (db) return db;

  // MongoClient の作成
  client = new MongoClient(ENV.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  // 接続
  await client.connect();

  // デフォルトデータベースに接続
  db = client.db();
  console.log("MongoDB Atlas に接続しました🔪❤️");
  return db;
}

/**
 * MongoDB 接続を切断する関数
 */
export async function disconnectDB() {
  if (!client) return;
  await client.close();
  console.log("MongoDB Atlas の接続を切断しました💔💔");
}

// 未使用だが、テスト用に残しておく
/**
 * テスト用に直接実行する場合
 * DB に ping を送って接続確認
 */
if (require.main === module) {
  (async () => {
    try {
      const database = await connectDB();
      await database.admin().command({ ping: 1 });
      console.log("Pingテスト 成功：MongoDB に接続できました！");
    } catch (err) {
      console.error("DB 接続テスト失敗", err);
    } finally {
      await disconnectDB();
    }
  })();
}
