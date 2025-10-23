import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy as Auth0Strategy } from "passport-auth0";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import adminRouter from "./routes/admin.js";
import ticketsRouter from "./routes/tickets.js";
import { getActiveRound } from "./models/Round.js";
import { countTickets } from "./models/Tickets.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser
app.use(bodyParser.json());

// ---------------------
// CORS (frontend na localhost:3000)
app.use(cors({
    origin: "http://localhost:5000",
    credentials: true
}));

// ---------------------
// Session & Auth0 setup
// ---------------------
app.use(
    session({
        secret: process.env.SESSION_SECRET || "supersecretkey",
        resave: false,
        saveUninitialized: true,
        cookie: { sameSite: "lax" } // dodaj ovo
    })
)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serviranje statičkog frontenda
app.use(express.static(path.join(__dirname, "../../frontend")));

// Passport Auth0
passport.use(
    new Auth0Strategy(
        {
            domain: process.env.AUTH0_DOMAIN,
            clientID: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            callbackURL: process.env.AUTH0_CALLBACK_URL || `http://localhost:${PORT}/callback`
        },
        (accessToken, refreshToken, extraParams, profile, done) => {
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

// Middleware za zaštitu korisničkih ruta
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: "Niste prijavljeni" });
}

// ---------------------
// Frontend rute
// ---------------------
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

// API ruta za dohvat kola
app.get("/api/round", async (req, res) => {
    try {
        const round = await getActiveRound();
        const ticketsCount = round ? await countTickets(round.id) : 0;

        res.json({
            active: round ? round.active : false,
            tickets: ticketsCount,
            numbers: round && round.numbers ? round.numbers.split(",").map(Number) : null,
            user: req.user || null,
            canSubmit: round ? round.active : false
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška pri dohvat kola" });
    }
});

// ---------------------
// Auth0 rute
// ---------------------
app.get("/login", passport.authenticate("auth0", { scope: "openid email profile" }));

app.get("/callback",
    passport.authenticate("auth0", { failureRedirect: "/" }),
    (req, res) => res.redirect("/")
);

app.get("/logout", (req, res) => {
    req.logout(() => res.redirect("/"));
});

// ---------------------
// Korisničke rute
// ---------------------
app.use("/tickets", ensureAuthenticated, ticketsRouter);

// ---------------------
// Admin rute (JWT)
import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ["RS256"]
});

app.use("/new-round", checkJwt, adminRouter);
app.use("/close", checkJwt, adminRouter);
app.use("/store-results", checkJwt, adminRouter);

// ---------------------
// Pokretanje servera
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
