import { pb } from '../config/pocketbase.js';
import { createNfesFormDataArray } from "../funcs/convertFormdata.js"

const cleanData = (data) => {
    return Object.fromEntries(
        Object.entries(data).filter(([_, v]) =>
            v !== '' && v !== null && v !== undefined && v !== ' '
        )
    );
};

export const PocketBaseRepository = {
    getAll: (collection, filter) =>
        pb.collection(collection).getFullList({ filter }),

    createWithFiles: async (collection, nfesArray, batchSize = 10) => {
        if (nfesArray && nfesArray.length > 0) {
            const results = [];
            const formDataArray = createNfesFormDataArray(nfesArray)

            for (let i = 0; i < formDataArray.length; i += batchSize) {
                const chunk = formDataArray.slice(i, i + batchSize);
                const chunkResults = await Promise.all(
                    chunk.map((formData, index) =>
                        pb.collection(collection).create(formData, {
                            requestKey: `create-${i + index}-${Date.now()}`
                        })
                    )
                );
                results.push(...chunkResults);
            }
            return results;
        }
    },

    createBatch: async (collection, items) => {
        if (items && items.length > 0) {
            const batch = pb.createBatch();
            items.forEach(data => {
                batch.collection(collection).create(cleanData(data));
            });
            try {
                return await batch.send();
            } catch (error) {
                console.error('Batch error details:', JSON.stringify(error.response, null, 2));
                throw error;
            }
        }
    },

    updateBatch: async (collection, items) => {
        if (items && items.length > 0) {
            const batch = pb.createBatch();
            items.forEach(data => {
                const { id, ...rest } = cleanData(data);
                batch.collection(collection).update(id, rest);
            });
            try {
                return await batch.send();
            } catch (error) {
                console.error('Batch error details:', JSON.stringify(error.response, null, 2));
                throw error;
            }
        }
    },
};