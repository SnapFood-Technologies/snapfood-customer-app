import moment from 'moment';
import * as RNLocalize from 'react-native-localize';
import { getStorageKey, KEYS, setStorageKey } from './storage';
import en from '../../translations/en';
import sq from '../../translations/sq';
import it from '../../translations/it';
import gr from '../../translations/gr';
import i18n from 'i18next';
// import 'moment/src/locale/en-gb'
// import 'moment/src/locale/sq';

const resources = {
    en: {
        translation: en,
    },
    sq: {
        translation: sq,
    },
    it: {
        translation: it,
    },
    gr: {
        translation: gr,
    },
};

export const translate = (key, config) => {
    return i18n.t(key, config);
};

export const getLanguage = () => {
    return i18n.language;
};

export const setLanguage = async (language) => {
    moment.locale('en');
    await i18n.changeLanguage(language);
    await setStorageKey(KEYS.LANGUAGE, language);
};

export const setI18nConfig = () => {
    return new Promise(async resolve => {
        let languageCode = null;
        let country = RNLocalize.getCountry();
        if (country != null) {
            if (country.toLowerCase() == 'us') {
                languageCode = 'en';
            }
            else if (country.toLowerCase() == 'gr') {
                languageCode = 'gr';
            }
            else if (country.toLowerCase() == 'it') {
                languageCode = 'it';
            }
        }

        const fallback = { languageTag: 'sq', isRTL: false };
        let languageTag;
        try {
            languageTag = await getStorageKey(KEYS.LANGUAGE);
            console.log('getStorageKey language : ', languageTag)
        } catch (e) {
            console.log('Error getStorageKey(KEYS.LANGUAGE)', e)
            await setLanguage(languageCode != null ? languageCode : fallback.languageTag);
        }
        if (!languageTag) {
            await setLanguage(languageCode != null ? languageCode : fallback.languageTag);
        }
        else {
            await setLanguage(languageTag);
        }
        moment.locale('en');
        resolve();
    });
};

i18n.init({
    resources,
    lng: 'sq', // 'en',
    fallbackLng: 'en',// 'sq',
    interpolation: {
        escapeValue: false,
    },
    cleanCode: true,
});

export default i18n;

export const appMoment = moment;
