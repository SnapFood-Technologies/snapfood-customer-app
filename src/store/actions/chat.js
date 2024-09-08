import FireStore, { FieldValue } from '../../common/services/firebase';
import { getStorageKey, KEYS } from '../../common/services/storage';
import { APP } from '../types';
import store from '../../store';

var channel_collection = FireStore.collection('channels')


export const setAllChannels = (payload) => {
    return { type: APP.SET_CHANNELS, payload: payload }
}

export const setMessagesByChannel = (payload) => ({ type: APP.SET_MESSAGES_BY_CHANNEL,payload });

export const setNewInvites = (payload) => ({ type: APP.SET_NEW_INVITES, payload })

export const setChannelsLoading = (payload) => {
	return { type: APP.SET_CHANNELS_LOADING, payload: payload };
};

export const setAllCallChannels = (payload) => {
    return { type: APP.SET_CALL_CHANNELS, payload: payload }
}

export const setOpenStoryImgPickModal = (payload) => {
    return { type: APP.SET_OPEN_STORY_IMG_PICK_MODAL, payload: payload }
}

const generateRandom = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


