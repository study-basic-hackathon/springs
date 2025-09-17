import { Db } from "mongodb";
/**
 * MongoDB に接続する関数
 * 他のファイルから呼び出して使う
 */
export declare function connectDB(): Promise<Db>;
/**
 * MongoDB 接続を切断する関数
 */
export declare function disconnectDB(): Promise<void>;
