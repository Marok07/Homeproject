import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Hiányzó token!' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Érvénytelen vagy lejárt token!' });
        req.user = user;
        next();
    });
};

app.post('/reg', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Minden mező kitöltése kötelező!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'Sikeres regisztráció!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A felhasználónév vagy email már foglalt!' });
        }
        res.status(500).json({ message: 'Szerverhiba a regisztráció során.' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Hibás email vagy jelszó!' });
        }

        const payload = { id: user.id, username: user.username, email: user.email };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, 
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken, user: payload });
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba a bejelentkezés során.' });
    }
});

app.post('/refresh-token', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Nincs refresh token!' });

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE refresh_token = ?', [refreshToken]);
        const user = rows[0];
        if (!user) return res.status(403).json({ message: 'Érvénytelen refresh token!' });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Lejárt refresh token!' });

            const payload = { id: user.id, username: user.username, email: user.email };
            const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

            res.json({ accessToken: newAccessToken, user: payload });
        });
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba a token frissítésekor.' });
    }
});

app.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await pool.query('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?', [refreshToken]);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Sikeres kijelentkezés!' });
});

app.get('/profil', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!rows[0]) return res.status(404).json({ message: 'Felhasználó nem található.' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba a profil lekérésekor.' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Szerver fut a http://localhost:${process.env.PORT} címen`);
});