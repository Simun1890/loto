import { pool } from "../db/db.js";

export async function createRound() {
    await pool.query("INSERT INTO rounds (active) VALUES (TRUE)");
}

export async function getActiveRound() {
    const result = await pool.query(
        "SELECT * FROM rounds WHERE active = TRUE ORDER BY id DESC LIMIT 1"
    );
    return result.rows[0] || null;
}
export async function getLastClosedRoundWithoutResults() {
    const result = await pool.query(
        "SELECT * FROM rounds WHERE active = FALSE AND numbers IS NULL ORDER BY id DESC LIMIT 1"
    );
    return result.rows[0] || null;
}

export async function closeRound() {
    await pool.query("UPDATE rounds SET active = FALSE WHERE active = TRUE");
}

export async function storeResults(numbers) {
    // Provjera da je niz
    if (!Array.isArray(numbers)) throw new Error("Neispravan format brojeva");

    // Validacija duljine
    if (numbers.length < 6 || numbers.length > 10) throw new Error("Neispravan broj brojeva");

    // Validacija raspona
    const outOfRange = numbers.some(n => n < 1 || n > 45);
    if (outOfRange) throw new Error("Brojevi moraju biti između 1 i 45");

    // Provjera duplikata
    const duplicates = numbers.some((n, i) => numbers.indexOf(n) !== i);
    if (duplicates) throw new Error("Postoje duplikati među brojevima");

    // Dohvat kola
    const round = await getLastClosedRoundWithoutResults();
    if (!round) throw new Error("Nema aktivnog kola");

    // Spremanje
    const result = await pool.query(
        "UPDATE rounds SET numbers = $1 WHERE id = $2 RETURNING *",
        [numbers, round.id]
    );
    return result.rows[0];
}