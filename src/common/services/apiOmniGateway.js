// Import your existing utilities
import axios from 'axios';
import Config from '../../config';
import DeviceInfo from 'react-native-device-info';
import { getLanguage } from './translate';

// Create the OmniGateway factory function
export const createOmniGateway = (clientApiKey) => {
  const manufacturer = DeviceInfo.getManufacturer();
  const model = DeviceInfo.getModel();
  const systemVersion = DeviceInfo.getSystemVersion();
  const appVersion = DeviceInfo.getVersion();
  const platform = Config.isAndroid ? 'Android' : 'iOS';
  
  const omniGateway = axios.create({
    timeout: 30000,
    baseURL: Config.OMNI_GATEWAY_URL,
    headers: {
      'x-api-key': Config.OMNI_GATEWAY_API_KEY,
      'client-x-api-key': clientApiKey || Config.OMNI_GATEWAY_CLIENT_API_KEY,
      'Content-Type': 'application/json',
      'X-PLATFORM': platform,
      'X-MANUFACTURER': manufacturer,
      'X-DEVICE-MODEL': model,
      'X-SYSTEM-VERSION': systemVersion,
      'X-APP-VERSION': appVersion,
      'X-UUID': DeviceInfo.getUniqueId(),
      'Accept-Language': getLanguage(),
    },
  });

  omniGateway.interceptors.request.use(
    async (config) => {
      // Ensure we always have the latest language setting
      config.headers['Accept-Language'] = getLanguage();
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  omniGateway.interceptors.response.use(
    (response) => response,
    (error) => {
      return Promise.reject(error.response ? error.response.data : error);
    }
  );

  return omniGateway;
};

// Create a default instance
const omniGateway = createOmniGateway();

export default omniGateway;