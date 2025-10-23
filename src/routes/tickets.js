// routes/tickets.js
import express from "express";
import { getActiveRound } from "../models/Round.js";
import { createTicket } from "../models/Tickets.js";
import QRCode from "qrcode";

const router = express.Router();

/**
 * POST /tickets
 * Unos loto listića od strane prijavljenog korisnika
 * Body: { idNumber: "1234567890", numbers: [1,2,3,4,5,6] }
 */
router.post("/", async (req, res) => {
    try {
        const { idNumber, numbers } = req.body;

        // Provjera korisničkog unosa
        if (!idNumber || idNumber.length > 20) return res.status(400).json({ error: "Neispravan broj osobne iskaznice/putovnice" });
        if (!Array.isArray(numbers)) return res.status(400).json({ error: "Brojevi moraju biti niz" });
        if (numbers.length < 6 || numbers.length > 10) return res.status(400).json({ error: "Neispravan broj brojeva" });
        if (numbers.some(n => n < 1 || n > 45)) return res.status(400).json({ error: "Brojevi moraju biti između 1 i 45" });
        if (numbers.some((n, i) => numbers.indexOf(n) !== i)) return res.status(400).json({ error: "Postoje duplikati među brojevima" });

        // Dohvat aktivnog kola
        const round = await getActiveRound();
        if (!round || !round.active) return res.status(400).json({ error: "Kolo nije aktivno" });

        // Spremanje u bazu i dobivanje ID-a listića
        const ticket = await createTicket(round.id, idNumber, numbers);

        // Generiranje QR koda koji vodi na javnu stranicu s podacima
        const qrData = `${process.env.BASE_URL}/tickets/${ticket.id}`;
        const qrImage = await QRCode.toDataURL(qrData);

        res.json({ ticketId: ticket.id, qr: qrImage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška na serveru" });
    }
});

export default router;
