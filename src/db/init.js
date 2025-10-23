import { pool } from "./db.js";

const createTables = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS rounds (
        id SERIAL PRIMARY KEY,
        active BOOLEAN NOT NULL DEFAULT FALSE,
        numbers INTEGER[],
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY,
        round_id INTEGER REFERENCES rounds(id),
        personal_id VARCHAR(20) NOT NULL,
        numbers INTEGER[] NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log("✅ Tables created successfully!");
    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        pool.end();
    }
};

createTables();