"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("../db/mongo");
async function main() {
    try {
        const db = await (0, mongo_1.connectDB)();
        // DB 名一覧を取得して確認
        const dbs = await db.admin().listDatabases();
        console.log("接続成功！ DB 一覧:", dbs.databases.map((d) => d.name));
    }
    catch (err) {
        console.error("接続失敗", err);
    }
    finally {
        await (0, mongo_1.disconnectDB)();
    }
}
main();
//# sourceMappingURL=test-db.js.map