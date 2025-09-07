"use strict";
// 完成版
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Express アプリの起動＋ルータ登録のみ行う
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const posts_1 = __importDefault(require("./api/posts"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// 投稿 API ルータを登録
app.use("/queue", posts_1.default);
// サーバー起動
app.listen(env_1.ENV.PORT, () => {
    console.log(`Server running on http://localhost:${env_1.ENV.PORT}`);
});
//# sourceMappingURL=server.js.map