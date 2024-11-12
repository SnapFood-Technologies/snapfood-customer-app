import FireStore, { FieldValue } from '../../common/services/firebase';
import apiFactory from '../../common/services/apiFactory';
import { translate } from './translate';
import { ROLE_CUSTOMER } from '../../config/constants';

export const channel_collection = FireStore.collection('channels')

export const createSingleChannel = async (user, partner, withRider = false) => {

    try {
        let channelId = channel_collection.doc().id;
        await channel_collection.doc(channelId).set({
            id: channelId,
            active: true,
            channel_type: 'single',
            withRider: withRider,
            creator: {
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
            last_msg: {
                createdAt: FieldValue.serverTimestamp()
            },
            unread_cnt: {
            }
        });

        return channelId;
    }
    catch (error) {
        return null
    }
};


export const createGroupChannel = async (group_data) => {

    try {
        let channelId = group_data.id || channel_collection.doc().id;
        await channel_collection.doc(channelId).set({
            id: channelId,
            active: true,
            channel_type: 'group',
            ...group_data,
            last_msg: {
                createdAt: FieldValue.serverTimestamp()
            },
            unread_cnt: {
            }
        });

        return channelId;
    }
    catch (error) {
        
        return null
    }
};

export const getChannelData = async (channelId) => {
    try {
        let channel_ref = await channel_collection.doc(channelId).get();
        return channel_ref.data()
    }
    catch (error) {
        return null
    }
}

export const findChannel = async (user_id, partner_id) => {
    try {
        let channel_ref = await channel_collection.where('channel_type', '==', 'single')
            .where('users', 'in', [[user_id, partner_id], [partner_id, user_id]])
            .get();
        let found_channel = null
        channel_ref.docs.forEach(doc => {
            if (doc.data() != null) {
                found_channel = doc.data()
            }
        })
        return found_channel
    }
    catch (error) {
        
        return null
    }
}

export const seenUnreadCntChannel = async (channelData, user_id) => {
    try {
        if (channelData != null) {
            let users_in_channel = channelData.users || [];
            let cur_unread = channelData.unread_cnt || {};
            users_in_channel.map(item => {
                if (item == user_id) {
                    cur_unread[item] = 0;
                }
            })
            await channel_collection.doc(channelData.id).update('unread_cnt', cur_unread)
        }
    }
    catch (error) {
        return null
    }
}

export const setLike = async (channelData, user_id, msg, onSuccess = () => { }) => {
    try {
        if (channelData != null && channelData.users && msg != null) {
            let likes = msg.likes || [];
            const foundIndex = likes.findIndex(i => i == user_id);
            if (foundIndex == -1) {
                likes.push(user_id);
            }
            else {
                likes = likes.filter(i => i != user_id)
            }
            await channel_collection.doc(channelData.id).collection('messages').doc(msg._id).update('likes', likes);
            onSuccess(msg._id, likes);
            if (foundIndex == -1) {  // when new add
                if (msg.user && msg.user._id != user_id) { // if this messge is not my message
                    let message = 'Pëlqeu mesazhin tënd';
                    if (channelData.channel_type == 'group') {
                        message = 'Reagoi ndaj mesazhit tënd';
                    }

                    let member_users = [];
                    let member_riders = [];

                    if (msg.user.role == CONSTANTS.ROLE_RIDER) {
                        // member_riders.push(msg.user._id);   // dont send like noti to riders for now because rider app does not support likes
                    }
                    else if (msg.user.role == CONSTANTS.ROLE_CUSTOMER) {
                        member_users.push(msg.user._id);
                    }

                    if (member_users.length > 0 || member_riders.length > 0) {
                        // send notification
                        sendChatNotification(
                            channelData.id,
                            channelData.channel_type,
                            channelData.channel_type == 'group' ? channelData.full_name : null,
                            user_id,
                            member_users,
                            member_riders,
                            message
                        );
                    }
                }
            }
        }
    }
    catch (error) {
    }
}

const getMsgDescription = (msg) => {
    if (msg == null) { return ''; }
    if (msg.map != null) {
        return 'sent_location';
    }
    else if (msg.emoji != null) {
        return 'sent_emoji';
    }
    else if (msg.images != null) {
        if (msg.reply_type == 'story' && msg.text != null) {
            return translate('social.replied_to_story') + ': ' +  msg.text;
        }
        return 'sent_image';
    }
    else if (msg.audio != null) {
        return 'sent_voice';
    }
    else if (msg.text != null) {
        if (msg.reply_type == 'story') {
            return translate('social.replied_to_story') + ': ' +  msg.text;
        }
        return msg.text;
    }
    return ''
}

export const deleteMessage = async (channelId, messageId) => {
    try {
        await channel_collection
            .doc(channelId)
            .collection('messages')
            .doc(messageId)
            .delete();
    } catch (err) {
        
    }
}

export const updateLastMessageOnChannel = async (channelId, newLastMsg) => {
    try {
        await channel_collection
            .doc(channelId)
            .update({
                last_msg: (newLastMsg == null ? { createdAt: FieldValue.serverTimestamp() } : newLastMsg)
            });
    } catch (err) {
        
    }
}

export const sendMessage = async (channelId, user_id, message) => {
    try {
        let created_time = new Date().getTime();
        let serverTimeResponse = await apiFactory.get('server-time');

        if (serverTimeResponse != null && serverTimeResponse.data != null && serverTimeResponse.data.time != null) {
            
            created_time = serverTimeResponse.data.time;
        }
        if (message._id == null) {
            message._id = channel_collection.doc(channelId).collection('messages').doc().id;
        }
        let new_msg = {
            ...message,
            created_time: created_time,
            createdAt: FieldValue.serverTimestamp()
        };
        await channel_collection
            .doc(channelId)
            .collection('messages').doc(message._id).set(new_msg);

        let channel_ref = await channel_collection.doc(channelId).get()
        if (channel_ref.data() != null) {
            let unread_cnt = {};
            let member_ids = [];
            let users_in_channel = channel_ref.data().users || [];
            let cur_unread = channel_ref.data().unread_cnt || {};
            users_in_channel.map(item => {
                if (item != user_id) {
                    if (cur_unread[item] != null) {
                        unread_cnt[item] = (cur_unread[item] || 0) + 1
                    }
                    else {
                        unread_cnt[item] = 1
                    }
                    member_ids.push(item);
                }
            })
            await channel_collection.doc(channelId).update('unread_cnt', unread_cnt, 'last_msg', new_msg);


            let member_users = [];
            let member_riders = [];

            if (channel_ref.data().channel_type == 'single' && channel_ref.data().withRider == true) {
                member_riders = member_ids;
            }
            else {
                member_users = member_ids;
            }

            // send notification
            sendChatNotification(
                channelId,
                channel_ref.data().channel_type,
                channel_ref.data().channel_type == 'group' ? channel_ref.data().full_name : null,
                user_id,
                member_users,
                member_riders,
                getMsgDescription(new_msg)
            );
        }

    } catch (err) {
        
    }
};

export const uploadImage = (base64Image) => {
    return apiFactory.post('chats/upload-image', {
        image: base64Image
    });
};

export const sendGroupChatInviteNotification = (conversation_id, group_name, member_ids) => {
    apiFactory.post('chats/send-groupchat-invite', {
        conversation_id: conversation_id,
        group_name: group_name,
        member_ids: member_ids
    })
        .then(res => { })
        .catch(err => { });
}

export const sendChatNotification = (conversation_id, channel_type, group_name, sender_id, member_users, member_riders, message) => {
    apiFactory.post('chats/send-chat-notification', {
        conversation_id: conversation_id,
        channel_type: channel_type,
        group_name: group_name,
        sender_id: sender_id,
        member_ids: member_users,
        member_riders: member_riders,
        message: message
    })
        .then(res => { })
        .catch(err => { });
}

export const updateChannelUserInfo = async (user) => {
    try {
        let channel_creator_ref = await channel_collection.where('channel_type', '==', 'single')
            .where('creator.id', '==', user.id)
            .get();

        let channel_partner_ref = await channel_collection.where('channel_type', '==', 'single')
            .where('partner.id', '==', user.id)
            .get();


        var batch = FireStore.batch();
        channel_creator_ref.docs.forEach(doc => {
            if (doc.data() != null) {
                let new_creator = {
                    ...doc.data().creator,
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    photo: user.photo
                };
                let channel_item_ref = channel_collection.doc(doc.data().id);
                batch.update(channel_item_ref, { "creator": new_creator });
            }
        })
        channel_partner_ref.docs.forEach(doc => {
            if (doc.data() != null) {
                let new_partner = {
                    ...doc.data().partner,
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    photo: user.photo
                };
                let channel_item_ref = channel_collection.doc(doc.data().id);
                batch.update(channel_item_ref, { "partner": new_partner });
            }
        })

        await batch.commit()
    }
    catch (error) {
        
        return null
    }
}

export const deleteChannel = async (channelId) => {
    try {
        await channel_collection.doc(channelId).delete();
        return true
    }
    catch (error) {
        return false
    }
}

export const deleteUserChannels = async (user_id) => {
    try {
        let channel_ref = await channel_collection
            .where('channel_type', '==', 'single')
            .where('users', 'array-contains', user_id)
            .get();
        for(let i = 0; i < channel_ref.docs.length; i ++) {
            if (channel_ref.docs[i].exists) {
                await channel_collection.doc(channel_ref.docs[i].id).delete();
            }
        }
        return true;
    }
    catch (error) {
        
        return false;
    }
}

export const exitGroupChannel = async (channelData, user_id) => {
    try {
        let new_users = channelData.users.filter(i => i != user_id)
        let new_members = channelData.members.filter(i => i.id != user_id)

        if (channelData.admin != null && channelData.admin.id == user_id) {
            await channel_collection.doc(channelData.id).update(
                'admin', new_members[0],
                'members', new_members,
                'users', new_users
            )
        }
        else {
            await channel_collection.doc(channelData.id).update(
                'members', new_members,
                'users', new_users
            )
        }
        return true
    }
    catch (error) {
        return false
    }
}
