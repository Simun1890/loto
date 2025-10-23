import express from "express";
import { createRound, closeRound, storeResults, getActiveRound } from "../models/Round.js";

const router = express.Router();

/**
 * POST /
 * Pokreće novo kolo (ako već nije aktivno)
 */
router.post("/new-round", async (req, res) => {
    try {
        const current = await getActiveRound();
        if (current) return res.sendStatus(204); // već aktivno

        await createRound();
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * POST /close
 * Zatvara trenutno aktivno kolo
 */
router.post("/close", async (req, res) => {
    try {
        const current = await getActiveRound();
        if (!current) return res.sendStatus(204); // nema aktivnog kola

        await closeRound();
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * POST /store-results
 * Sprema izvučene brojeve
 * JSON format: { "numbers": [1,2,3,4,5,6] }
 */
router.post("/store-results", async (req, res) => {
    try {
        const { numbers } = req.body;

        const result = await storeResults(numbers);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);

        // Mapiranje grešaka u razumljive poruke i status
        switch (err.message) {
            case "Neispravan format brojeva":
            case "Neispravan broj brojeva":
            case "Brojevi moraju biti između 1 i 45":
            case "Postoje duplikati među brojevima":
                return res.status(400).json({ error: err.message });

            case "Nema aktivnog kola":
                return res.status(400).json({ error: err.message });

            default:
                return res.status(500).json({ error: "Greška na serveru" });
        }
    }
});

export default router;
