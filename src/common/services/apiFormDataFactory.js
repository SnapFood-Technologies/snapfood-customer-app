import axios from 'axios';
import Config from '../../config';
import DeviceInfo from 'react-native-device-info';
import { getStorageKey, KEYS, setStorageKey } from './storage';
import { getLanguage } from './translate';

const manufacturer = DeviceInfo.getManufacturer();
const model = DeviceInfo.getModel();
const systemVersion = DeviceInfo.getSystemVersion();
const appVersion = DeviceInfo.getVersion();
const platform = Config.isAndroid ? 'Android' : 'iOS';

const factory = new axios.create({
	timeout: 30000,
	baseURL: Config.BASE_URL,
	headers: {
		'App-Key': Config.APP_KEY,
		'X-Requested-With': 'XMLHttpRequest',
		'Content-Type': 'multipart/form-data',
		'X-PLATFORM': platform,
		'X-MANUFACTURER': manufacturer,
		'X-DEVICE-MODEL': model,
		'X-SYSTEM-VERSION': systemVersion,
		'X-APP-VERSION': appVersion,
		'X-UUID': DeviceInfo.getUniqueId(),
	},
});

factory.interceptors.request.use(
	async (config) => {
		config.headers['Accept-Language'] = getLanguage();
		try {
			const token = await getStorageKey(KEYS.TOKEN);
			if (!config.headers.Authorization && token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		} catch (e) {
			//Not logged in
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

factory.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			//  
		}
		return Promise.reject(error.response ? error.response.data : error);
	}
);

export default factory;
