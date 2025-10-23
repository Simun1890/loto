// models/Tickets.js
import { pool } from "../db/db.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Kreira novi listić u bazi
 * @param {string} personal_id
 * @param {number[]} numbers
 * @param {number} round_id
 * @returns {string} ticket_id (UUID)
 */
export async function createTicket(personal_id, numbers, round_id) {
    const id = uuidv4();
    const numbersStr = numbers.join(",");

    const query = `
      INSERT INTO tickets (id, personal_id, numbers, round_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [id, personal_id, numbersStr, round_id]);
    return result.rows[0].id;
}

/**
 * Dohvaća podatke o pojedinom listiću
 * @param {string} id
 * @returns {object|null}
 */
export async function getTicket(id) {
    const query = `
      SELECT t.id, t.personal_id, t.numbers, r.id as round_id, r.active, r.numbers as drawn_numbers
      FROM tickets t
      JOIN rounds r ON t.round_id = r.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
        ticket_id: row.id,
        personal_id: row.personal_id,
        numbers: row.numbers.split(",").map(Number),
        round_id: row.round_id,
        active: row.active,
        drawn_numbers: row.drawn_numbers ? row.drawn_numbers.split(",").map(Number) : null
    };
}

/**
 * Broji listiće u kolu
 */
export async function countTickets(round_id) {
    const query = `SELECT COUNT(*) FROM tickets WHERE round_id = $1`;
    const result = await pool.query(query, [round_id]);
    return parseInt(result.rows[0].count, 10);
}
