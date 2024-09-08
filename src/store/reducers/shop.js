import {APP} from '../types';
import {OrderType_Delivery, Pay_COD} from '../../config/constants';
import { stat } from 'react-native-fs';

const INITIAL_STATE = { 
    items: [],
    vendorData: {},
    cutlery : 1,
    coupon: {},
    comments: '',
    order_for: null,
    confirm_legal_age: false,
    cartPrice : {
        subtotal : 0,
        discount : 0,
        cashback : 0,
        small_order_fee : 0, 
        delivery_fee : 0,
        order_total : 0,
        min_order_price : 0,
        promo_code : '',
    },
    delivery_info : {
        handover_method: '',
        address : {},
        contactless_delivery : false,
        tip_rider : 0, 
        comments: '',
        pickup_date : '',
        pickup_time : '',
        num_guests : 0,
        reserve_for : {},
        is_schedule: 0,
        schedule_time: null,
        is_gift: false,
        gift_recip_name: '',
        gift_recip_phone: '',
        gift_recip_id: null,
        gift_recip_is_friend : false,
        gift_from: '',
        gift_message: '',
        gift_permission: false,
        gift_non_user : null,
        gift_is_referral : false,
        gift_recip_address : {},
    }, 
    payment_info : {
        method : 'cash',
        cards: [],
        selected_card: null,
        comments: '',
        splits : []
    },
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case APP.UPDATE_CART_ITEMS: {
            return {
                ...state,
                items: action.payload,
                payment_info : {
                    ...state.payment_info,
                    splits : []
                }
            };
        }
        case APP.CLEAR_CART : {
            return {
                ...INITIAL_STATE,
                items: action.payload || [],
                payment_info : {
                    ...state.payment_info,
                    splits : []
                }
            };
        } 
        case APP.SET_CUTLERY_CART: {
            return {
                ...state,
                cutlery: action.payload,
            };
        }
        case APP.SET_COMMENT_CART: {
            return {
                ...state,
                comments: action.payload,
            };
        }
        case APP.SET_COUPON_CART: {
            return {
                ...state,
                coupon: action.payload || {},
            };
        }
        case APP.SET_PRICE_CART: {
            return {
                ...state,
                cartPrice: action.payload,
            };
        }

        case APP.SET_DELIVERY_INFO_CART: {
            return {
                ...state,
                delivery_info : {
                    ...state.delivery_info,
                    ...action.payload
                }
            };
        } 
        case APP.SET_PAYMENT_INFO_CART: {
            return {
                ...state,
                payment_info: action.payload,
            };
        } 

        case APP.SET_ORDER_FOR: {
            return {
                ...state,
                order_for: action.payload,
            };
        } 

        case APP.SET_CONFIRM_LEGAL_AGE: {
            return {
                ...state,
                confirm_legal_age: action.payload || false,
            };
        } 
        
        case APP.SET_VENDOR_CART: {
            return {
                ...state, 
                vendorData: action.payload,
                cutlery: (action.payload?.id != state.vendorData?.id ? 1 : state.cutlery),
                payment_info : {
                    ...state.payment_info,
                    splits : []
                }
            };
        }  
        default:
            return {...state};
    }
};

