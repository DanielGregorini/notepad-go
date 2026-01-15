import { MongoClient, Db } from "mongodb";

const uri = "mongodb://admin:admin@localhost:27017";
const client = new MongoClient(uri);

let db: Db;

export async function connectMongo(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db("notepad");
    console.log("✅ MongoDB conectado (driver nativo)");
  }
  return db;
}
