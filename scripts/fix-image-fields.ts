import * as dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

async function runAlters() {
    const connectionString = process.env.DATABASE_URL!;
    console.log(`Connecting to: ${connectionString}`);
    
    const connection = await mysql.createConnection(connectionString);
    
    try {
        console.log("Altering 'user' table...");
        await connection.execute("ALTER TABLE user MODIFY image LONGTEXT");
        console.log("Altering 'services' table...");
        await connection.execute("ALTER TABLE services MODIFY image LONGTEXT");
        console.log("Success!");
    } catch (error) {
        console.error("Error running alters:", error);
    } finally {
        await connection.end();
    }
}

runAlters();
