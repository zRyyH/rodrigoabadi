export function mapData(data, mapping) {
    return data.map(item => {
        const newItem = {};
        for (const key in item) {
            const newKey = mapping[key] || key;
            newItem[newKey] = item[key];
        }
        return newItem;
    });
}