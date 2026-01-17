import { MongoClient, Db } from "mongodb";
import "dotenv/config";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const client = new MongoClient(uri);

let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db("notepad");
    console.log("✅ MongoDB conectado (driver nativo)");
  }
  return db;
}
