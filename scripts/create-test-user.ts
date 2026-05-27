import * as dotenv from "dotenv";
dotenv.config();

import { auth } from "../lib/auth";
import { headers } from "next/headers";

async function createTestUser() {
    const email = "test@example.com";
    const password = "Password123!";
    const name = "Test User";

    console.log(`Attempting to create test user: ${email}`);

    try {
        const res = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            },
        });

        console.log("Test user created successfully!");
        console.log("----------------------------");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log("----------------------------");
    } catch (error: any) {
        if (error.status === 400 && error.message?.includes("already exists")) {
            console.log("Test user already exists.");
            console.log("----------------------------");
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log("----------------------------");
        } else {
            console.error("Error creating test user:", error);
        }
    }
}

createTestUser();
