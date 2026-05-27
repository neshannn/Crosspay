import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../lib/db";
import { user, account } from "../lib/db/schema";

async function checkUsers() {
    try {
        const users = await db.select().from(user);
        console.log("Users in DB:", JSON.stringify(users, null, 2));

        const accounts = await db.select().from(account);
        console.log("Accounts in DB:", JSON.stringify(accounts, null, 2));
    } catch (error) {
        console.error("Error checking DB:", error);
    }
}

checkUsers();
