export function normalizer(data, normalizer) {
    return data.map(item => {
        const normalized = { ...item };
        for (const [campo, fn] of Object.entries(normalizer)) {
            if (campo in normalized && typeof fn === 'function') {
                normalized[campo] = fn(normalized[campo]);
            }
        }
        return normalized;
    });
}