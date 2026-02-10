import type { VercelRequest, VercelResponse } from '@vercel/node';

const APP_USER = process.env.APP_USER;
const APP_PASS = process.env.APP_PASS;

const buildToken = (username: string, password: string) => {
    return Buffer.from(`${username}:${password}`).toString('base64');
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    if (!APP_USER || !APP_PASS) {
        return res.status(500).json({ error: 'Server credentials not configured' });
    }

    if (username !== APP_USER || password !== APP_PASS) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = buildToken(username, password);
    return res.status(200).json({ token });
}