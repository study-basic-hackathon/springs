"use strict";
// 完成版
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Express アプリの起動＋ルータ登録＋MongoDB接続＋Graceful Shutdown
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const posts_1 = __importDefault(require("./api/posts"));
const mongo_1 = require("./db/mongo");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// MongoDB 接続してサーバー起動
(async () => {
    try {
        await (0, mongo_1.connectDB)(); // サーバー起動時に自動接続
        // 投稿 API ルータを登録
        app.use("/queue", posts_1.default);
        // サーバー起動
        const server = app.listen(env_1.ENV.PORT, () => {
            console.log(`Server running on http://localhost:${env_1.ENV.PORT}`);
        });
        // サーバー終了時のクリーンアップ
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} 受信 → サーバーを停止します...`);
            server.close(async () => {
                console.log("HTTP サーバー停止完了");
                await (0, mongo_1.disconnectDB)(); // ここでDB(Atlas)切断
                process.exit(0);
            });
        };
        process.on("SIGINT", () => gracefulShutdown("SIGINT (Ctrl+C)"));
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    }
    catch (err) {
        console.error("DB接続失敗！", err);
        process.exit(1);
    }
})();
//# sourceMappingURL=server.js.map