import { Platform } from 'react-native';
import FireStore, { FieldValue } from '../../common/services/firebase';
import apiFactory from '../../common/services/apiFactory';
import apiFormDataFactory from '../../common/services/apiFormDataFactory';
import { translate } from './translate';

export const story_collection = FireStore.collection('user-story')

export const updateStory = async (user, photoUrl, thumbUrl, isCaptured = false, mentions = []) => {
    try {
        let foundStory = await findUserStory(user.id);
        let storyId = story_collection.doc().id;

        let created_time = new Date().getTime();
        let serverTimeResponse = await apiFactory.get('server-time');

        if (serverTimeResponse != null && serverTimeResponse.data != null && serverTimeResponse.data.time != null) {
            console.log('serverTimeResponse.data.time: ', serverTimeResponse.data.time);
            created_time = serverTimeResponse.data.time;
        }

        let stories = [];
        if (foundStory && foundStory.id) {
            storyId = foundStory.id;
            stories = foundStory.stories || [];

            stories = stories.filter(s => s.story_id > (created_time - 24 * 60 * 60 * 1000))
        }

        if (photoUrl) {
            stories.push({
                story_id: created_time,
                story_image: photoUrl,
                story_image_thumb: thumbUrl,
                story_captured: isCaptured,
                story_mentions: mentions.map(m => ({
                    id: m.id,
                    photo: m.photo || null,
                    full_name: m.full_name || null,
                    username: m.username || null,
                    phone: m.phone || null,
                    email: m.email || null,
                }))
            })
        }

        await story_collection.doc(storyId).set({
            id: storyId,
            active: true,
            user_id: user.id,
            user_image: user.photo || null,
            user_fullname: user.full_name || null,
            user_name: user.username || null,
            user_phone: user.phone || null,
            user_email: user.email || null,
            user_story_public: user.story_public ?? 0,
            stories: stories,
            createdAt: created_time,
            unseen_cnt: {}
        });

        apiFactory.post('chats/send-story-notification', {
            story_id: storyId,
            sender_id: user.id,
            mentions: mentions.map(m => m.id)
        })
            .then(res => { })
            .catch(err => { });

        return storyId;
    }
    catch (error) {
        console.log('updateStory ', error)
        return null
    }
};


export const getStoryData = async (storyId) => {
    try {
        let data_ref = await story_collection.doc(storyId).get();
        return data_ref.data()
    }
    catch (error) {
        return null
    }
}

export const findUserStory = async (user_id) => {
    try {
        let data_ref = await story_collection.where('user_id', '==', user_id)
            .get();
        let found_story = null
        data_ref.docs.forEach(doc => {
            if (doc.data() != null) {
                found_story = doc.data()
            }
        })
        return found_story
    }
    catch (error) {
        console.log('findUserStory', error)
        return null
    }
}

export const updateSeenStory = async (storyData, user_id) => {
    try {
        if (storyData != null) {
            let cur_unseen = storyData.unseen_cnt || {};
            cur_unseen[user_id] = 0;
            await story_collection.doc(storyData.id).update('unseen_cnt', cur_unseen)
        }
    }
    catch (error) {
        return null
    }
}

export const updateStoryViewers = async (image, storyData, user_id) => {
    try {
        if (storyData) {
            let _stories = storyData.stories || [];
            let findIndex = _stories.findIndex(s => s.story_image == image);
            if (findIndex != -1) {
                let viewers = _stories[findIndex].viewers || [];
                if (viewers.findIndex(v => v == user_id) == -1) {
                    viewers.push(user_id);
                    _stories[findIndex].viewers = viewers;
                    await story_collection.doc(storyData.id).update('stories', _stories);
                }
            }
        }
    }
    catch (error) {
        return null
    }
}

export const uploadImage = (base64Image) => {
    return apiFactory.post('chats/upload-image', {
        image: base64Image
    });
};

export const uploadVideo = (file, isMuted) => {
    console.log('============ uploadVideo ', file)
    const data = new FormData();
    data.append('file', {
        name: file.fileName || file.uri.substring(file.uri.lastIndexOf('/') + 1),
        type: file.type,
        uri: (Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri),
    });
    data.append('isMuted', (isMuted == true ? 1 : 0));
    return apiFormDataFactory.post('chats/upload-video', data);
};

export const deleteStory = async (image, storyData) => {
    try {
        if (storyData) {
            let _stories = storyData.stories || [];
            _stories = _stories.filter(s => s.story_image != image);
            await story_collection.doc(storyData.id).update('stories', _stories);
        }
        return true
    }
    catch (error) {
        return false
    }
}


export const deleteUserStory = async (user_id) => {
    try {
        let data_ref = await story_collection.where('user_id', '==', user_id).get();
        let found_story = null
        data_ref.docs.forEach(doc => {
            if (doc.data() != null) {
                found_story = doc.data()
            }
        })
        if (found_story != null) {
            await story_collection.doc(found_story.id).delete();
        }
        return true;
    }
    catch (error) {
        console.log('findUserStory', error)
        return false;
    }
} 