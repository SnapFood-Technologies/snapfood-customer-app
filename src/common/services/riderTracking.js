import FireStore, { FieldValue } from '../../common/services/firebase'; 

export const tracking_collection = FireStore.collection('trackings')

export const updateLocation = async (user_id, lat, lng) => {
    try {
        await tracking_collection.doc('' + user_id).set({
            id: user_id,
            lat: lat,
            lng: lng,
        });
    }
    catch (error) {
        console.log('tracking updateLocation ', error);
    }
};
