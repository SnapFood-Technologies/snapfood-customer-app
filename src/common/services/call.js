import FireStore, { FieldValue } from '../../common/services/firebase';
import apiFactory from '../../common/services/apiFactory';
import { translate } from './translate';
import { ROLE_CUSTOMER, CALL_STATUS } from '../../config/constants';

export const call_channel_collection = FireStore.collection('call-channels')

export const startCall = async (user, partner, isVideoCall = false) => {
    try {
        let channelId = call_channel_collection.doc().id;

        let res = await apiFactory.post('call/send-incoming-call', {
            channel_id: channelId,
            receiver_ids: [partner.id],
            call_type : isVideoCall ? 'video' : 'audio'
        });

        if (res.data && res.data.time) {
            await call_channel_collection.doc(channelId).set({
                id: channelId,
                status: CALL_STATUS.calling,
                isVideoCall : isVideoCall,
                caller: {
                    id: user.id,
                    username: user.username || null,
                    full_name: user.full_name || null,
                    photo: user.photo || null,
                    phone: user.phone || null,
                    email: user.email || null,
                    role: ROLE_CUSTOMER
                },
                partner: {
                    id: partner.id,
                    username: partner.username || null,
                    full_name: partner.full_name || null,
                    photo: partner.photo || null,
                    phone: partner.phone || null,
                    email: partner.email || null,
                    role: partner.role || ROLE_CUSTOMER
                },
                users: [user.id, partner.id],
                createdAt: res.data.time,
                duration: 0,
                seen: {
                    [partner.id]: false
                },
                user_status : {
                    [user.id] : CALL_STATUS.calling
                }
            });

            return channelId;
        }

        return null;
    }
    catch (error) {
        console.log('startCall error ', error)
        return null;
    }
};

export const getReceiverStatus = async (channelId, receiver_id) => {
    try {
        let channel_ref = await call_channel_collection.doc(channelId).get();
        let callChannelData = channel_ref.data();
        let user_status =  callChannelData.user_status || {};

        return user_status[receiver_id];
    }
    catch (error) {
        return null
    }
}

export const updateCallChannelStatus = async (channelId, user_id, status) => {
    try {
        let channel_ref = await call_channel_collection.doc(channelId).get();
        let callChannelData = channel_ref.data();
        let user_status =  callChannelData.user_status || {};
        user_status = {...user_status, [user_id] : status};

        await call_channel_collection.doc(channelId).update('user_status', user_status);
    }
    catch (error) {
        return null
    }
}

export const updateCallDuration = async (channelId, duration) => {
    try {
        await call_channel_collection.doc(channelId).update('duration', (duration || 0));
    }
    catch (error) {
    }
}

export const getCallChannelData = async (channelId) => {
    try {
        let channel_ref = await call_channel_collection.doc(channelId).get();
        return channel_ref.data()
    }
    catch (error) {
        return null
    }
}

export const getCallHistory = async (user_id, partner_id) => {
    try {
        let channel_ref = await call_channel_collection
            .where('users', 'in', [[user_id, partner_id], [partner_id, user_id]])
            .get();
        let history = [];
        channel_ref.docs.forEach(doc => {
            if (doc.data() != null) {
                history.push(doc.data());
            }
        })
        return history;
    }
    catch (error) {
        console.log('getCallHistory', error)
        return [];
    }
}

export const seenCallChannel = async (channelData, user_id) => {
    try {
        if (channelData != null) {
            let seen = channelData.seen || {};
            seen[user_id] = true;
            await call_channel_collection.doc(channelData.id).update('seen', seen);

            return true;
        }
        return false;
    }
    catch (error) {
        console.log('seenCallChannel', error)
        return false;
    }
}

export const getAgoraToken = (channel_id, user_id, role) => {
    return apiFactory.post('call/get-agora-token', {
        channel_id: channel_id,
        user_id: user_id,
        role: role
    });
}

export const deleteUserCallChannels = async (user_id) => {
    try {
        let channel_ref = await call_channel_collection
            .where('users', 'array-contains', user_id)
            .get();
        for(let i = 0; i < channel_ref.docs.length; i ++) {
            if (channel_ref.docs[i].exists != null) {
                await call_channel_collection.doc(channel_ref.docs[i].id).delete();
            }
        }
        return true;
    }
    catch (error) {
        console.log('deleteUserCallChannels', error)
        return false;
    }
}