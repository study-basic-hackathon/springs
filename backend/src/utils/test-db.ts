import { connectDB, disconnectDB } from "../db/mongo";

async function main() {
  try {
    const db = await connectDB();
    // DB 名一覧を取得して確認
    const dbs = await db.admin().listDatabases();
    console.log(
      "接続成功！ DB 一覧:",
      dbs.databases.map((d) => d.name)
    );
  } catch (err) {
    console.error("接続失敗", err);
  } finally {
    await disconnectDB();
  }
}

main();
