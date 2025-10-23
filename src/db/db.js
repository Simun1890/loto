import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // obavezno za Render i slične servise
});

export async function testConnection() {
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("🟢 DB connected:", res.rows[0].now);
    } catch (err) {
        console.error("🔴 DB connection error:", err);
    }
}