"use strict";
// 完成版
// connectDB() で Atlas のデフォルト DB に接続
// disconnectDB() で切断可能
// デバッグログで URI を確認できる
// テスト実行も if (require.main === module) 部分で簡単にできる
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongodb_1 = require("mongodb");
const env_1 = require("../config/env");
// MongoDB クライアントと DB を格納する変数
let client;
let db;
/**
 * MongoDB に接続する関数
 * 他のファイルからも呼び出して接続可能
 */
async function connectDB() {
    // すでに接続済みなら再利用
    if (db)
        return db;
    // デバッグログ
    console.log("ENV.MONGODB_URI =", env_1.ENV.MONGODB_URI);
    // MongoClient の作成
    client = new mongodb_1.MongoClient(env_1.ENV.MONGODB_URI, {
        serverApi: {
            version: mongodb_1.ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });
    // 接続
    await client.connect();
    // デフォルトデータベースに接続
    db = client.db();
    console.log("MongoDB に接続しました🔪❤️");
    return db;
}
/**
 * MongoDB 接続を切断する関数
 */
async function disconnectDB() {
    if (!client)
        return;
    await client.close();
    console.log("MongoDB の接続を切断しました");
}
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
        }
        catch (err) {
            console.error("DB 接続テスト失敗", err);
        }
        finally {
            await disconnectDB();
        }
    })();
}
//# sourceMappingURL=mongo.js.map