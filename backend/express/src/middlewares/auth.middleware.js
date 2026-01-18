import { verifyToken } from '../services/auth.service.js';

export async function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const data = await verifyToken(token);

        if (!data) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        req.user = data.record;
        req.token = data.token;
        next();
    } catch {
        res.status(500).json({ error: 'Erro interno' });
    }
}