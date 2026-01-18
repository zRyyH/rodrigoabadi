export default {
    port: process.env.PORT || 3000,
    pocketbase: {
        url: process.env.POCKETBASE_URL || 'http://127.0.0.1:8090',
        collection: process.env.COLLECTION || 'users'
    }
};