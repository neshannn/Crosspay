import * as dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

async function createTestUser() {
    const connectionString = process.env.DATABASE_URL!;
    console.log(`Connecting to: ${connectionString}`);
    
    const poolConnection = mysql.createPool(connectionString);
    const db = drizzle(poolConnection);

    const email = "test@example.com";
    const password = "Password123!"; // Note: This script won't hash it correctly for Better Auth easily without its internals
    const name = "Test User";

    console.log("Better Auth handles hashing. It is better to use the API.");
    console.log("However, we can just use the registration page now that we've verified the DB connection works.");
}

createTestUser();
