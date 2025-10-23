import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import QRCode from "qrcode";

export default function Home() {
    const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
    const [roundData, setRoundData] = useState(null);
    const [personalId, setPersonalId] = useState("");
    const [numbers, setNumbers] = useState("");
    const [qr, setQr] = useState("");

    const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchRound = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/round`, { credentials: "include" });
                const data = await res.json();
                setRoundData(data);
            } catch (err) {
                console.error(err);
                setRoundData({ error: "Greška pri učitavanju kola" });
            }
        };

        fetchRound();
    }, []);

    const submitTicket = async () => {
        try {
            const numsArray = numbers.split(",").map(n => parseInt(n.trim()));
            const res = await fetch(`${BASE_URL}/tickets`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idNumber: personalId, numbers: numsArray })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error);
                return;
            }

            const data = await res.json();
            setQr(data.qr);
            alert("Listić uspješno poslan!");
        } catch (err) {
            console.error(err);
            alert("Greška na serveru.");
        }
    };

    if (!roundData) return <p>Učitavanje...</p>;
    if (roundData.error) return <p>{roundData.error}</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Loto 6/45</h1>

            {isAuthenticated ? (
                <div>
                    <p>Prijavljen korisnik: {user.name}</p>
                    <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
                </div>
            ) : (
                <button onClick={() => loginWithRedirect()}>Login</button>
            )}

            <hr />

            <p>Aktivno kolo: {roundData.active ? "Da" : "Ne"}</p>
            <p>Broj listića: {roundData.tickets || 0}</p>
            <p>Izvučeni brojevi: {roundData.numbers ? roundData.numbers.join(", ") : "-"}</p>

            {roundData.canSubmit && isAuthenticated && (
                <div style={{ marginTop: 20 }}>
                    <h3>Unos listića</h3>
                    <input
                        placeholder="Broj osobne iskaznice"
                        maxLength={20}
                        value={personalId}
                        onChange={e => setPersonalId(e.target.value)}
                    />
                    <br />
                    <input
                        placeholder="6-10 brojeva odvojeno zarezom"
                        value={numbers}
                        onChange={e => setNumbers(e.target.value)}
                    />
                    <br />
                    <button onClick={submitTicket}>Pošalji listić</button>
                    {qr && (
                        <div style={{ marginTop: 20 }}>
                            <p>QR kod:</p>
                            <img src={qr} alt="QR code" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
