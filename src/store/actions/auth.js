import { KEYS, setStorageKey } from '../../common/services/storage';
import { APP } from '../types';
import apiFactory from '../../common/services/apiFactory';
import messaging from '@react-native-firebase/messaging';

export const PHONE_NOT_VERIFIED = 'PHONE_NOT_VERIFIED';

const getLoggedInUserData = () => {
    return new Promise(async (resolve, reject) => {
        try {
            apiFactory.get('users').then((res) => {
                resolve(res.data.user);
            })
                .catch(err => {
                    reject(err);
                });
        } catch (e) {
            reject(e);
        }
    });
};

export const legacyLogin = token => async dispatch => {
    return new Promise(async (resolve, reject) => {
        let device = { token: '1234' };
        try {
            device.token = await messaging().getToken();
        } catch (e) {
        }

        
        apiFactory.post('login/legacy', { device }, {
            headers: {
                Authorization: token,
            },
        })
            .then(async (response) => {
                const { token, verified_by_mobile } = response.data;
                await setStorageKey(KEYS.TOKEN, token);
                const user = await getLoggedInUserData();

                dispatch({
                    type: APP.SET_USER_DATA,
                    payload: user,
                });
                dispatch({
                    type: APP.SET_HAS_VERIFIED_PHONE,
                    payload: !!verified_by_mobile,
                });

                resolve(user);
            })
            .catch((e) => {
                reject(e);
            })
    });
};

export const login = ({ email, password }) => async dispatch => {
    return new Promise(async (resolve, reject) => {
        let device = { token: '1234' };
        try {
            device.token = await messaging().getToken();
        } catch (e) {
        }
        apiFactory.post('login', { email, password, device })
            .then(async (response) => {
                const { token, verified_by_mobile } = response.data;
                await setStorageKey(KEYS.TOKEN, token);
                const user = await getLoggedInUserData();

                dispatch({
                    type: APP.SET_USER_DATA,
                    payload: user,
                });
                dispatch({
                    type: APP.SET_HAS_VERIFIED_PHONE,
                    payload: !!verified_by_mobile,
                });

                resolve(user);

            })
            .catch((e) => {
                reject(e);
            })
    });
};

export const register = (user) => () => {
    return new Promise(async (resolve, reject) => {
        let device = { token: '1234' };
        try {
            device.token = await messaging().getToken();
        } catch (e) {
        }
        if (user.refferalCode) {
            dispatch({
                type: APP.REMOVE_LINKED_REFFERAL_CODE,
            });
        }
        apiFactory.post('register', { ...user, device }).then(resolve, reject);
    });
};

export const facebookLogin = (token, refferalCode) => async dispatch => {
    return new Promise(async (resolve, reject) => {
        let device = { token: '1234' };
        try {
            device.token = await messaging().getToken();
        } catch (e) {
        }

        apiFactory.post('login/facebook', {
            access_token: token,
            device,
            refferal_code: refferalCode,
        })
            .then(async ({ data }) => {
                await setStorageKey(KEYS.TOKEN, data.token);
                const user = await getLoggedInUserData();
                dispatch({
                    type: APP.SET_USER_DATA,
                    payload: user,
                });
                dispatch({
                    type: APP.SET_HAS_VERIFIED_PHONE,
                    payload: !!user['verified_by_mobile'],
                });
                if (refferalCode) {
                    dispatch({
                        type: APP.REMOVE_LINKED_REFFERAL_CODE,
                    });
                }

                resolve(user);

            })
            .catch((e) => {
                reject(e);
            })
    });
};

export const googleLogin = (id_token, refferalCode) => async dispatch => {
    return new Promise(async (resolve, reject) => {
        let device = { token: '1234' };
        try {
            device.token = await messaging().getToken();
        } catch (e) {
        }

        apiFactory.post('login/google', {
            id_token: id_token,
            device,
            refferal_code: refferalCode,
        })
            .then(async ({ data }) => {

                

                await setStorageKey(KEYS.TOKEN, data.token);
                const user = await getLoggedInUserData();
                dispatch({
                    type: APP.SET_USER_DATA,
                    payload: user,
                });
                dispatch({
                    type: APP.SET_HAS_VERIFIED_PHONE,
                    payload: !!user['verified_by_mobile'],
                });

                if (refferalCode) {
                    dispatch({
                        type: APP.REMOVE_LINKED_REFFERAL_CODE,
                    });
                }

                resolve(user);

            })
            .catch((e) => {
                reject(e);
            })
    });
};

export const appleLogin = ({ user, identityToken, email, fullName, refferalCode }) => async dispatch => {

    return new Promise(async (resolve, reject) => {
        let device = { token: '1234' };
        try {
            device.token = await messaging().getToken();
        } catch (e) {
        }

        if (!email) { email = ""; }

        if (!fullName.nickName) { fullName = "" }
        else { fullName = fullName.nickName; }

        apiFactory.post('login/apple',
            {
                apple_id: user,
                apple_identity_token: identityToken,
                email: email,
                name: fullName,
                refferal_code: refferalCode,
                device
            })
            .then(async (response) => {

                const { token, verified_by_mobile } = response.data;
                await setStorageKey(KEYS.TOKEN, token);
                const user = await getLoggedInUserData();

                dispatch({
                    type: APP.SET_USER_DATA,
                    payload: user,
                });

                dispatch({
                    type: APP.SET_HAS_VERIFIED_PHONE,
                    payload: !!verified_by_mobile,
                });

                if (refferalCode) {
                    dispatch({
                        type: APP.REMOVE_LINKED_REFFERAL_CODE,
                    });
                }

                resolve(user);
            })
            .catch((e) => {
                reject(e);
            })
    });

};

export const setAsLoggedIn = () => async dispatch => {
    return new Promise(async (resolve, reject) => {
        try {
            await dispatch({
                type: APP.LOGGED_IN,
                payload: true,
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

export const setAsSeenOnboard = () => async dispatch => {
    return new Promise(async (resolve, reject) => {
        try {
            await dispatch({
                type: APP.SEEN_ONBOARD,
                payload: true,
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

export const logout = () => async dispatch => {
    return new Promise(async (resolve) => {
        try {
            apiFactory.get('logout').then();
            await setStorageKey(KEYS.TOKEN, null);
            await dispatch({
                type: APP.LOGGED_IN,
                payload: false,
            });
            await dispatch({
                type: APP.USER_LOGGED_OUT,
                payload: false,
            });
            dispatch({
                type: APP.SET_ADDRESSES,
                payload: [],
            });
            dispatch({
                type: APP.SET_ADDRESS,
                payload: {},
            });
            resolve();
        } catch (e) {
            resolve();
        }
    });
};

export const updateProfileDetails = (user) => async dispatch => {
    return new Promise(async (resolve, reject) => {
        apiFactory.put('users', {
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            photo: user.photo,
            gender: user.gender,
            birthday: user.birthday,
            push_notis: user.push_notis,
            email_notis: user.email_notis,
            promo_notis: user.promo_notis,
            blog_notifications: user.blog_notifications,
            story_public: user.story_public,
            gallery_public: user.gallery_public,
            interests_public: user.interests_public,
            bio_text: user.bio_text,
            bio_text_public: user.bio_text_public,
            latitude: user.latitude,
            longitude: user.longitude,
            default_card_id: user.default_card_id,
            map_latitude: user.map_latitude,
            map_longitude: user.map_longitude,
            location_permission: user.location_permission,
        }).then(async ({ data }) => {
            // dispatch({
            //     type: APP.SET_HAS_VERIFIED_PHONE,
            //     payload: !!data.user['verified_by_mobile'],
            // }); 
            // 
            await dispatch({
                type: APP.SET_USER_DATA,
                payload: data.user,
            });
            resolve(data.user);
        }, reject);
    });
};

export const changePassword = (old_password, password) => async dispatch => {
    return new Promise(async (resolve, reject) => {
        apiFactory.put('users', {
            old_password: old_password,
            password: password,
        }).then(resolve, reject);
    });
};

export const setHasVerifiedPhone = (value) => async dispatch => {
    dispatch({
        type: APP.SET_HAS_VERIFIED_PHONE,
        payload: value,
    });
};

export const setUserNeedLogin = (value) => async dispatch => {
    dispatch({
        type: APP.SET_NEED_LOGIN,
        payload: value,
    });
};

export const getLoggedInUser = () => dispatch => {
    return new Promise(async (resolve) => {
        try {
            const user = await getLoggedInUserData();
            dispatch({
                type: APP.SET_USER_DATA,
                payload: user,
            });
            dispatch({
                type: APP.SET_HAS_VERIFIED_PHONE,
                payload: !!user['verified_by_mobile'],
            });
            resolve(user);
        } catch (e) {

            resolve();
        }
    });
};
