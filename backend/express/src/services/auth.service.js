import config from '../config.js';

export async function verifyToken(token) {
    const { url, collection } = config.pocketbase;

    const response = await fetch(`${url}/api/collections/${collection}/auth-refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) return null;

    return response.json();
}