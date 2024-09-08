import FireStore, { FieldValue } from '../../common/services/firebase';

export const debug_collection = FireStore.collection('debug-log')

export const addLog = async (key, data) => {
    try {
        await debug_collection.doc(key).set({
            time: new Date().toISOString(),
            data: data
        });
    }
    catch (error) {
    }
};
