import { pb } from '../config/pocketbase.js';

export const PocketBaseRepository = {
    getAll: (collection, filter) =>
        pb.collection(collection).getFullList({ filter }),

    createBatch: async (collection, items) => {
        const batch = pb.createBatch();
        items.forEach(data => batch.collection(collection).create(data));
        return batch.send();
    },

    updateBatch: async (collection, items) => {
        const batch = pb.createBatch();
        items.forEach(({ id, data }) => batch.collection(collection).update(id, data));
        return batch.send();
    },
};