import React, { useState } from "react";
import axios from "axios";

export default function TicketForm({ baseUrl, onTicketSubmitted }) {
    const [personalId, setPersonalId] = useState("");
    const [numbers, setNumbers] = useState("");
    const [qr, setQr] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setQr(null);

        // Parsiranje brojeva
        const nums = numbers
            .split(",")
            .map(n => parseInt(n.trim()))
            .filter(n => !isNaN(n));

        setLoading(true);
        try {
            const res = await axios.post(`${baseUrl}/tickets`, {
                personal_id: personalId,
                numbers: nums
            });

            setQr(res.data.qr);
            setPersonalId("");
            setNumbers("");
            if (onTicketSubmitted) onTicketSubmitted();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Greška na serveru");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: 20 }}>
            <h2>Unos listića</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Broj osobne iskaznice / putovnice:</label><br />
                    <input
                        type="text"
                        maxLength="20"
                        value={personalId}
                        onChange={e => setPersonalId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>6-10 brojeva (odvojeno zarezom):</label><br />
                    <input
                        type="text"
                        placeholder="npr. 1,2,3,4,5,6"
                        value={numbers}
                        onChange={e => setNumbers(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Slanje..." : "Pošalji listić"}
                </button>
            </form>

            {qr && (
                <div style={{ marginTop: 20 }}>
                    <h3>QR kod listića:</h3>
                    <img src={qr} alt="QR kod listića" />
                </div>
            )}
        </div>
    );
}
