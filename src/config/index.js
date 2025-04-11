import { Platform } from 'react-native';

const local = {
	isAndroid: Platform.OS === 'android',
	BASE_URL: 'http://10.10.17.143:8000/api/',
	APP_KEY: 'SNAPFOOD-3exeAtM4CMRAKNWNdza92QyP4',
	GOOGLE_MAP_API_KEY: 'AIzaSyAEe-vcJ-r8w9FQdVEskAozi1v9cWy6YAA',
	API_KEY_OPEN_CAGE: 'b99bbb1ecc8443a39a35d666087604fd',
	WEB_PAGE_URL: 'http://v3webbeta.snapfood.al/',
	IMG_BASE_URL: 'https://snapfoodal.imgix.net/',
	USER_PROFILE_IMG_BASE_URL: 'https://sf-users.s3.eu-central-1.amazonaws.com/',
	STRIPE_PUB_KEY : 'pk_test_51HW5IXCu9YeioLarfAExO0hfGZvIXq3qxW5dWE2KzMYqqCCn0KlzPFupkbib2tCQzkGQxHr4AWFLU2F0fz1qmZVh00OhQ6LLVB',
	APPlE_MERCHANT_ID : 'merchant.com.snapfood.al',
	AGORA_APP_ID : '3337d08760474de38097a1d4df9c0b92',
};


const beta = {
	isAndroid: Platform.OS === 'android',
	BASE_URL: 'https://stageapi.snapfood.al/api/',
	APP_KEY: 'SNAPFOOD-3exeAtM4CMRAKNWNdza92QyP4',
	GOOGLE_MAP_API_KEY: 'AIzaSyAEe-vcJ-r8w9FQdVEskAozi1v9cWy6YAA',
	API_KEY_OPEN_CAGE: 'b99bbb1ecc8443a39a35d666087604fd',
	WEB_PAGE_URL: 'https://stageweb.snapfood.al/',
	IMG_BASE_URL: 'https://snapfoodal.imgix.net/',
	USER_PROFILE_IMG_BASE_URL: 'https://sf-users.s3.eu-central-1.amazonaws.com/',
	STRIPE_PUB_KEY : 'pk_test_51HW5IXCu9YeioLarfAExO0hfGZvIXq3qxW5dWE2KzMYqqCCn0KlzPFupkbib2tCQzkGQxHr4AWFLU2F0fz1qmZVh00OhQ6LLVB',
	APPlE_MERCHANT_ID : 'merchant.com.snapfood.al',
	AGORA_APP_ID : '3337d08760474de38097a1d4df9c0b92',
};

const live = {
	isAndroid: Platform.OS === 'android',
	BASE_URL: 'https://prodapi.snapfood.al/api/',
	APP_KEY: 'SNAPFOOD-3exeAtM4CMRAKNWNdza92QyP4',
	GOOGLE_MAP_API_KEY: 'AIzaSyAEe-vcJ-r8w9FQdVEskAozi1v9cWy6YAA',
	API_KEY_OPEN_CAGE: 'b99bbb1ecc8443a39a35d666087604fd',
	WEB_PAGE_URL: 'https://snapfood.al/',
	IMG_BASE_URL: 'https://snapfoodal.imgix.net/',
	USER_PROFILE_IMG_BASE_URL: 'https://sf-users.s3.eu-central-1.amazonaws.com/',
	STRIPE_PUB_KEY : 'pk_live_51MdheqBHV3SbtovKixMcb5SrbLkEKDnVtYoyd1AGAmnQHICr5udM16z3gnl2kCb09g7ZVJg7699WmmeTszC0bbMj00CNkWsbqt',
	APPlE_MERCHANT_ID : 'merchant.com.snapfood.al',
	AGORA_APP_ID : '3337d08760474de38097a1d4df9c0b92',
};

export default live;
