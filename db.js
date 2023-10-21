import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

async function dbConnect() {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log('DB connected - Status : Active')
    return client;
}

export const client = await dbConnect();