import { Db } from "mongodb";
/**
 * MongoDB に接続する関数
 * 他のファイルからも呼び出して接続可能
 */
export declare function connectDB(): Promise<Db>;
/**
 * MongoDB 接続を切断する関数
 */
export declare function disconnectDB(): Promise<void>;
