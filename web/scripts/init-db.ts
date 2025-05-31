import { db } from "@/lib/db";

async function init() {
    try {
        const result = await db.execute(`
        CREATE TABLE IF NOT EXISTS emails (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT DEFAULT CURRENT_TIMESTAMP,
          subject TEXT NOT NULL,
          sender TEXT NOT NULL,
          recipient TEXT NOT NULL,
          content TEXT NOT NULL,
          txhash TEXT,
          processed BOOLEAN DEFAULT FALSE,
          uniqueHash TEXT UNIQUE
        )
      `);
        console.log("✅ Table created:", result);
    } catch (error) {
        console.error("❌ Failed to create table:", error);
    }
}

init();