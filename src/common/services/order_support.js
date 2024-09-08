import FireStore, { FieldValue } from '../../common/services/firebase';
import apiFactory from '../../common/services/apiFactory';
import { translate } from './translate';
import { ROLE_CUSTOMER, ROLE_RIDER, ROLE_ADMIN, ROLE_RESTAURANT, SNAP_FOOD_ADMIN_CONTACT, ORDER_SUPPORT_ADMIN_MSG } from '../../config/constants';
import { SystemMessage } from 'react-native-gifted-chat';
import { isEmpty, ucFirst } from './utility';

export const order_support_collection = FireStore.collection('order_support')

export const createOrderSupportChannel = async (order, user, language) => {
    try {
        let members = [
            SNAP_FOOD_ADMIN_CONTACT,
            {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                photo: user.photo,
                phone: user.phone,
                email: user.email,
                role: ROLE_CUSTOMER
            }
        ];

        let vendorMemberData = null;

        if (order.vendorUserData && order.vendor) {
            const vendor_logo = 'https://snapfoodal.imgix.net/' + `${order.vendor.logo_thumbnail_path}`;
            vendorMemberData = {
                _id: order.vendorUserData.id,
                id: order.vendorUserData.id,
                full_name: order.vendor.title,
                photo: vendor_logo,
                avatar: vendor_logo,
                phone: order.vendor.phone_number || '',
                email: order.vendorUserData.email || '',
                role: ROLE_RESTAURANT
            };
            members.push(vendorMemberData);
        }

        const channelId = `order_${order.id}`;
        await order_support_collection.doc(channelId).set({
            id: channelId,
            active: true,
            channel_type: 'order_support',
            creator: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                photo: user.photo,
                phone: user.phone,
                email: user.email,
                role: ROLE_CUSTOMER
            },
            members: members,
            users: [...members.map(i => i.id)],
            last_msg: {
                createdAt: FieldValue.serverTimestamp()
            },
            unread_cnt: {
            }
        });

        await sendMessage(channelId, SNAP_FOOD_ADMIN_CONTACT.id, {
            text: (language == 'en' ? 'Write every question or request you might have regarding your order!' : 'Shkruaj çdo pyetje apo kërkesë për porosinë tënde!') ,
            system: true
        });

        //
        let firstName = '';
        if (user.full_name != null && user.full_name.trim() != '') {
            let tmpWords = user.full_name.trim().split(' ');
            if (tmpWords.length > 0) {
                firstName = ' ' + ucFirst(tmpWords[0]);
            }
        }
        //
        await sendMessage(channelId, SNAP_FOOD_ADMIN_CONTACT.id, {
            text: (
                language == 'en' ?
                `Hello ${firstName}, I am Oralf from Snapfood and I’m here to help you with your order.`
                :
                `Përshëndetje ${firstName}, jam Oralfi nga Snapfood për të të ndihmuar me gjithçka lidhur me porosinë.`
            ),
            user: {
                ...SNAP_FOOD_ADMIN_CONTACT,
                _id: SNAP_FOOD_ADMIN_CONTACT.id
            }
        });

        if (vendorMemberData &&
            order.status != 'delivered' &&
            order.status != 'declined' &&
            order.status != 'canceled') {
            await sendMessage(channelId, vendorMemberData._id, {
                text: (
                    language == 'en' ?
                    `Hello, it’s ${vendorMemberData.full_name}. We are preparing your order right away.`
                    :
                    `Përshëndetje nga ${vendorMemberData.full_name}. Porosia po përgatitet menjëherë.`
                ),
                user: vendorMemberData
            });
        }

        return channelId;
    }
    catch (error) {
        console.log('create group channel', error)
        return null
    }
};

export const getOrderSupportChannel = async (orderId) => {
    try {
        const channelId = `order_${orderId}`;
        let channel_ref = await order_support_collection.doc(channelId).get();
        return channel_ref.data()
    }
    catch (error) {
        return null
    }
}

export const getChannelData = async (channelId) => {
    try {
        let channel_ref = await order_support_collection.doc(channelId).get();
        return channel_ref.data()
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
            await order_support_collection.doc(channelData.id).update('unread_cnt', cur_unread)
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
            await order_support_collection.doc(channelData.id).collection('messages').doc(msg._id).update('likes', likes);
            onSuccess(msg._id, likes);
            if (foundIndex == -1) {  // when new add
                if (msg.user && msg.user._id != user_id) { // if this messge is not my message
                    let message = 'Pëlqeu mesazhin tënd';
                    if (channelData.channel_type == 'group') {
                        message = 'Reagoi ndaj mesazhit tënd';
                    }

                    let member_users = [];
                    let member_riders = [];

                    if (msg.user.role == ROLE_RIDER) {
                        // member_riders.push(msg.user._id);  // dont send like noti to riders for now because rider app does not support likes
                    }
                    else if (msg.user.role == ROLE_CUSTOMER) {
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
        return 'Shpërndau vendndodhjen';
    }
    else if (msg.emoji != null) {
        return 'Dërgoi një emoji';
    }
    else if (msg.images != null) {
        return 'Shpërndau një foto'
    }
    else if (msg.audio != null) {
        return 'Dërgoi një voice'
    }
    else if (msg.text != null) {
        return msg.text;
    }
    return ''
}

export const getMessageID=(channelId)=>{
    return order_support_collection.doc(channelId).collection('messages').doc().id;
}

export const sendMessage = async (channelId, user_id, message) => {
    try {
        let created_time = new Date().getTime();
        let serverTimeResponse = await apiFactory.get('server-time');

        if (serverTimeResponse != null && serverTimeResponse.data != null && serverTimeResponse.data.time != null) {
            console.log('serverTimeResponse.data.time: ', serverTimeResponse.data.time);
            created_time = serverTimeResponse.data.time;
        }
        if (message._id == null) {
            message._id = order_support_collection.doc(channelId).collection('messages').doc().id;
        }
        let new_msg = {
            ...message,
            created_time: created_time,
            createdAt: FieldValue.serverTimestamp()
        };
        await order_support_collection
            .doc(channelId)
            .collection('messages').doc(message._id).set(new_msg);

        let channel_ref = await order_support_collection.doc(channelId).get()
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
            await order_support_collection.doc(channelId).update('unread_cnt', unread_cnt, 'last_msg', new_msg);


            let member_users = [];
            let member_riders = [];

            for (let i = 0; i < member_ids.length; i++) {
                let memberId = member_ids[i];

                let members = channel_ref.data().members || [];
                let findMember = members.find(m => m.id == memberId);
                if (findMember && findMember.role == ROLE_RIDER) {
                    member_riders.push(memberId);
                }
                else if (findMember && findMember.role == ROLE_CUSTOMER) {
                    member_users.push(memberId);
                }
            }

            if (member_users.length > 0 || member_riders.length > 0) {
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
        }

    } catch (err) {
        console.log(err);
    }
};

export const deleteMessage = async (channelId, messageId) => {
    try {
        await order_support_collection
            .doc(channelId)
            .collection('messages')
            .doc(messageId)
            .delete();
    } catch (err) {
        console.log(err);
    }
}

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
        let channel_creator_ref = await order_support_collection.where('channel_type', '==', 'single')
            .where('creator.id', '==', user.id)
            .get();

        let channel_partner_ref = await order_support_collection.where('channel_type', '==', 'single')
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
                let channel_item_ref = order_support_collection.doc(doc.data().id);
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
                let channel_item_ref = order_support_collection.doc(doc.data().id);
                batch.update(channel_item_ref, { "partner": new_partner });
            }
        })

        await batch.commit()
    }
    catch (error) {
        console.log('findChannel', error)
        return null
    }
}

export const deleteChannel = async (channelId) => {
    try {
        await order_support_collection.doc(channelId).delete();
        return true
    }
    catch (error) {
        return false
    }
}

export const exitGroupChannel = async (channelData, user_id) => {
    try {
        let new_users = channelData.users.filter(i => i != user_id)
        let new_members = channelData.members.filter(i => i.id != user_id)

        if (channelData.admin != null && channelData.admin.id == user_id) {
            await order_support_collection.doc(channelData.id).update(
                'admin', new_members[0],
                'members', new_members,
                'users', new_users
            )
        }
        else {
            await order_support_collection.doc(channelData.id).update(
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
