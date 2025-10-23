import express from "express";
import { getActiveRound } from "../models/Round.js";
import { createTicket } from "../models/Tickets.js";
import QRCode from "qrcode";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { personal_id, numbers } = req.body;

        if (!personal_id || personal_id.length > 20)
            return res.status(400).json({ error: "Neispravan broj osobne iskaznice/putovnice" });

        if (!Array.isArray(numbers))
            return res.status(400).json({ error: "Brojevi moraju biti niz" });

        if (numbers.length < 6 || numbers.length > 10)
            return res.status(400).json({ error: "Neispravan broj brojeva" });

        if (numbers.some(n => n < 1 || n > 45))
            return res.status(400).json({ error: "Brojevi moraju biti između 1 i 45" });

        if (new Set(numbers).size !== numbers.length)
            return res.status(400).json({ error: "Postoje duplikati među brojevima" });

        const round = await getActiveRound();
        if (!round || !round.active)
            return res.status(400).json({ error: "Kolo nije aktivno" });

        // Spremanje u bazu
        const ticketId = await createTicket(personal_id, numbers, round.id);

        // QR kod koji vodi na javnu stranicu s podacima
        const qrData = `${process.env.BASE_URL || `http://localhost:5000`}/tickets/${ticketId}`;
        const qrImage = await QRCode.toDataURL(qrData);

        res.json({ ticketId, qr: qrImage });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška na serveru" });
    }
});

export default router;
