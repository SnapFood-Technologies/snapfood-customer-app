import * as StoreReview from 'react-native-store-review';
import {getStorageKey, KEYS, setStorageKey} from './storage';
import apiFactory from './apiFactory';

const COUNT_LIMIT = 10;

const _hasRated = async () => {
    try {
        return await getStorageKey(KEYS.HAS_RATED);
    } catch (e) {
        return false;
    }
};

const _getOpenedCount = async () => {
    try {
        return await getStorageKey(KEYS.APP_OPENED_COUNT);
    } catch (e) {
        return 0;
    }
};

const _shouldOpenModal = async () => {
    const hasRated = await _hasRated();
    if (hasRated) {
        return false;
    }
    const count = await _getOpenedCount();
    return count && count % COUNT_LIMIT === 0;
};

const _updateCount = async () => {
    const count = await _getOpenedCount();
    return await setStorageKey(KEYS.APP_OPENED_COUNT, count + 1);
}

const _openRateAppModal = () => {
    if (StoreReview.isAvailable) {
        setStorageKey(KEYS.HAS_RATED, true);
        StoreReview.requestReview();
    }
};

export const shouldOpenRateAppModal = _shouldOpenModal;
export const updateOpenedAppCount = _updateCount;
export const openRateAppModal = _openRateAppModal;
export const getOpenedAppCount = _getOpenedCount;

export const updateFakeBadgeLastTime = ()=>{
    try {
        setStorageKey(KEYS.FAKE_BADGE_LAST_TIME, new Date().getTime())
    }
    catch (e) {

    }
}

export const getFakeBadgeAvailabilty =  async () => {
    let available = false;
    try {
        let res = await apiFactory.get(`check-fake-badge`);
        if (res.data && res.data.available) {
            available = res.data.available;
        }
    } catch (error) { }

    try {
        console.log('getFakeBadgeAvailabilty ', available )
        const last_time = await getStorageKey(KEYS.FAKE_BADGE_LAST_TIME)
        if (available &&  new Date().getTime() > (parseInt(last_time) + (24 * 60 * 60 * 1000)) ) {
            return true
        }
        return false
    }
    catch (e) {
        return available;
    }
}
