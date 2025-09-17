"use strict";
// 完成版？おそらくこれ以上編集不要
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
// 環境変数を TypeScript で扱いやすくするためのラッパー
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    MONGODB_URI: process.env.MONGODB_URI ?? "",
    PORT: Number(process.env.PORT ?? 3000),
};
//# sourceMappingURL=env.js.map