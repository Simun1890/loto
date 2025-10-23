const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

export async function getRoundData() {
    const res = await fetch(`${BASE_URL}/api/round`, { credentials: "include" });
    if (!res.ok) throw new Error("Ne mogu dohvatiti kolo");
    return res.json();
}

export async function submitTicket(data) {
  const res = await fetch(`${BASE_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  });
  return res;
}