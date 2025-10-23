import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

export default function Home() {
    const { loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [roundData, setRoundData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/`);
                setRoundData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

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

            {roundData ? (
                <div>
                    <p>Aktivno kolo: {roundData.active ? "Da" : "Ne"}</p>
                    <p>Broj listića: {roundData.tickets || 0}</p>
                    <p>Izvučeni brojevi: {roundData.numbers ? roundData.numbers.join(", ") : "Nema"} </p>
                    {roundData.canSubmit && <p><a href="/tickets">Uplati listić</a></p>}
                </div>
            ) : (
                <p>Učitavanje...</p>
            )}
        </div>
    );
}