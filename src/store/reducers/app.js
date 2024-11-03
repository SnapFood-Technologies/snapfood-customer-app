import { APP } from '../types';
import { MEMBERSHIP_PLANS, OrderType_Delivery, VSort_Title } from '../../config/constants'
import RouteNames from '../../routes/names';
import { getLanguage } from '../../common/services/translate'

const INITIAL_STATE = {
    isLoggedIn: false,
    hasLocation: false,
    isVisibleTabBar: true,
    hasVerifiedPhone: false,
    skipReferralCodeInputView: false,
    seenOnboard: false,
    needLogin: false,

    pushOrderDetails: null,
    pushConversationId: null,
    pushBlogId: null,
    pushChatMsgTime: null,
    isOrderSummVisible: false,
    isWalletVisible: false,
    isInvitationVisible: false,
    isChatVisible: false,
    isBlogVisible: false,

    isIncomingCall: false,
    IncomingCallData: null,

    isEarnInviteDetailsVisible: false,
    push_earn_invitation_id: null,

    isReferralVisible: false,
    push_referral_id: null,

    isVendorVisible: false,
    pushVendorId: null,

    isSnapfooderVisible: false,
    pushSnapfooderId: null,

    isGeneralReferralVisible: false,
    isGeneralEarnVisible: false,
    isGeneralCashbackVisible: false,
    isGeneralStoryVisible: false,
    isGeneralStudentVerifyVisible: false,

    isCartSplitRequestVisible: false,
    push_cart_split_id: null,

    isGetPromoVisible: false,
    promo_code: null,

    coordinates: {},
    address: {},

    contacts: [],
    addresses: [],
    default_shippingaddress: {},
    user: {},
    home_vendor_filter: {
        vendor_type: 'Vendors',
        order_type: OrderType_Delivery,
        food_categs: [],
        is_meal: false,
        is_dietary: false,
        ongoing_offer: false,
        open_now: false,
        online_payment: false,
        delivery_by_snapfood: false,
        low_fee: null,
        high_fee: null,
        searchTerm: '',
    },
    home_vendor_sort: VSort_Title,

    hometabs_init_tabname: RouteNames.HomeStack,
    hometab_navigation: null,

    home_orders_filter: {
        discount: false,
        cashback: false,
        promotion: false,
        split: false,
        is_gift: false,
        searchTerm: '',
    },

    home_diff_location_tooltip: null,

    closedRestaurantData: {},
    isReviewModalVisible: false,
    reviewModalData: null,
    safeAreaDims: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    vendors: {
        loading: false,
        loaded: false,
        error: null,
        data: [],
        featured: [],
        exclusiveVendors: [],
        newVendors: [],
        freeDeliveryVendors: [],
    },
    featureBlocks: {
        loading: false,
        loaded: false,
        error: null,
        data: [],
    },
    favourites: {
        loading: false,
        loaded: false,
        error: null,
        data: [],
    },
    unreviewedorder: {
        loading: false,
        loaded: false,
        error: null,
        data: null,
    },
    banners: [],

    language: getLanguage() || 'sq',
    message: null,
    tmp_order: {},
    pass_changed: false,

    tmp_new_address: {},
    tmpFoodData: {},

    blog_categories: [],
    profile_blog_filter: {
        category_id: null,
        searchTerm: '',
    },

    default_orders_tab: null,

    show_contacts_modal: false,
    show_invite_contacts_friend_modal: false,
    show_remind_earn_invite_modal: false,
    show_remind_referral_modal: false,
    show_order_now_modal: false,
    asked_contacts_permission: false,
    asked_interests: false,
    shared_mime_type: null,
    shared_content: [],
    isSharingVisible: false,

    show_invite_mutual_friend_modal: false,
    invite_mutual_friends: [],

    invitationPickedUser: null,
    balanceTransferPickedUser: null,
    invitationRewardsSetting: [],
    referralsRewardsSetting: {},
    invitationTimerSetting: {},

    systemSettings: {},
    studentVerifySettings: {},

    show_change_city_modal: false,
    new_city_address: {},
    new_city_location: {},

    giftOrderPickedUser: null,
    unconfirmedDeliveryOrders: [],
    active_vendors: [],
    feedback_where_tags: [],
    show_feedback_where_heard_modal: false,
    announce_data: {},
    show_announce_modal: false,
    linkedRefferalCode: null,
    all_friends: [],
    activeRoute: 'HomeStack',
    homeScroller: null,
    vendor_ids_tmp: [],  // schedulable vendor ids which opened a closed vendor modal once,
    banner_promotion: null,
    student_banner_promotion: null,
    curPlayingVideo: null,
    has_splits: false,
    membershipSetting: {},
    tmpPickedMembershipPlan: MEMBERSHIP_PLANS.monthly,
    screenNavigate: '',
    all_banners: [],
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case APP.SAFE_AREA_DIMENSIONS:
            return { ...state, safeAreaDims: action.payload };
        case APP.LOGGED_IN:
            return { ...state, isLoggedIn: action.payload };
        case APP.SEEN_ONBOARD:
            return { ...state, seenOnboard: action.payload };
        case APP.SET_USER_DATA:
            return { ...state, user: action.payload };
        case APP.SET_HAS_VERIFIED_PHONE:
            return { ...state, hasVerifiedPhone: !!action.payload };
        case APP.SET_SKIP_REFERRAL_CODE_INPUT_VIEW:
            return { ...state, skipReferralCodeInputView: !!action.payload };
        case APP.SET_LOCATION_DATA:
            return { ...state, location: action.payload };
        case APP.APPLY_LOCATION: {
            return {
                ...state,
                hasLocation: true,
                coordinates: action.payload.coordinates,
                address: action.payload.address,
            };
        }
        case APP.TMP_SET_CUR_PLAYING_VIDEO_STORY:
            return { ...state, curPlayingVideo: action.payload };

        case APP.SET_CHANGE_CITY_MODAL: {
            return {
                ...state,
                show_change_city_modal: action.payload.showModal || false,
                new_city_address: action.payload.new_address || {},
                new_city_location: action.payload.new_location || {},
            };
        }
        case APP.SET_HASLOCATION_FLAG: {
            return { ...state, hasLocation: action.payload };
        }
        case APP.SET_NEED_LOGIN: {
            return { ...state, needLogin: action.payload };
        }
        case APP.SET_ACTIVE_SCREEN_FROM_PUSH: {
            return {
                ...state,
                isWalletVisible: action.payload.isWalletVisible == true,
                isOrderSummVisible: action.payload.isOrderSummVisible == true,
                isInvitationVisible: action.payload.isInvitationVisible == true,
                pushOrderDetails: action.payload.order,
                pushConversationId: action.payload.pushConversationId,
                pushBlogId: action.payload.pushBlogId,
                pushChatMsgTime: action.payload.pushChatMsgTime,
                isChatVisible: action.payload.isChatVisible == true,
                isBlogVisible: action.payload.isBlogVisible == true,

                isIncomingCall: action.payload.isIncomingCall == true,
                IncomingCallData: action.payload.IncomingCallData,

                isVendorVisible: action.payload.isVendorVisible == true,
                pushVendorId: action.payload.pushVendorId,

                isSnapfooderVisible: action.payload.isSnapfooderVisible == true,
                pushSnapfooderId: action.payload.pushSnapfooderId,

                isEarnInviteDetailsVisible: action.payload.isEarnInviteDetailsVisible == true,
                push_earn_invitation_id: action.payload.push_earn_invitation_id,

                isReferralVisible: action.payload.isReferralVisible == true,
                push_referral_id: action.payload.push_referral_id,

                isGeneralReferralVisible: action.payload.isGeneralReferralVisible == true,
                isGeneralEarnVisible: action.payload.isGeneralEarnVisible == true,
                isGeneralCashbackVisible: action.payload.isGeneralCashbackVisible == true,
                isGeneralStoryVisible: action.payload.isGeneralStoryVisible == true,
                isGeneralStudentVerifyVisible: action.payload.isGeneralStudentVerifyVisible == true,

                isCartSplitRequestVisible: action.payload.isCartSplitRequestVisible == true,
                push_cart_split_id: action.payload.push_cart_split_id,

                isGetPromoVisible: action.payload.isGetPromoVisible == true,
                promo_code: action.payload.promo_code,

                screenNavigate: action.payload.screenNavigate ? action.payload.screenNavigate : '',
            };
        }
        case APP.GET_BANNERS_SUCCESS: {
            return { ...state, banners: action.payload };
        }
        case APP.SET_UNREVIEWED_ORDER: {
            return {
                ...state,
                isReviewModalVisible: !!action.payload,
                reviewModalData: action.payload,
            };
        }
        case APP.CLOSE_REVIEW_MODAL: {
            return {
                ...state,
                isReviewModalVisible: false,
                reviewModalData: null,
            };
        }
        case APP.SET_ADDRESSES: {
            return {
                ...state,
                addresses: action.payload,
            };
        }
        case APP.DELETED_ADDRESS: {
            const { addresses } = state;

            return {
                ...state,
                addresses: addresses.filter(a => a.id !== action.payload),
            };
        }

        case APP.SET_DEFAULT_ORDERS_TAB:
            return { ...state, default_orders_tab: action.payload };

        case APP.SET_INIT_HOME_TAB:
            return { ...state, hometabs_init_tabname: action.payload };
        case APP.SET_HOMETAB_NAVIGATION:
            return { ...state, hometab_navigation: action.payload };

        case APP.TMP_PASS_CHANGED: {
            return { ...state, pass_changed: action.payload || false }
        }

        case APP.SET_HAS_SPLITS_REQUESTS: {
            return { ...state, has_splits: action.payload || false }
        }

        case APP.SET_VENDOR_FILTER: {
            return { ...state, home_vendor_filter: { ...state.home_vendor_filter, ...action.payload } }
        }
        case APP.SET_VENDOR_SORT: {
            return { ...state, home_vendor_sort: action.payload || VSort_Title }
        }

        case APP.SET_ORDERS_FILTER: {
            return { ...state, home_orders_filter: { ...state.home_orders_filter, ...action.payload } }
        }

        case APP.TMP_ADDR_PICKED: {
            return { ...state, tmp_new_address: action.payload || {} }
        }
        case APP.TMP_SET_FOOD: {
            
            return {
                ...state,
                tmpFoodData: action.payload || {},
            };
        }
        case APP.TMP_SET_ORDER: {
            return {
                ...state,
                tmp_order: action.payload || {},
            };
        }

        case APP.SET_LANG: {
            return { ...state, language: action.payload || 'sq' }
        }

        case APP.SET_BLOG_CATEGORIES: {
            return { ...state, blog_categories: action.payload || [] };
        }
        case APP.SET_PROFILE_BLOG_FILTER: {
            return { ...state, profile_blog_filter: { ...state.profile_blog_filter, ...action.payload } }
        }

        case APP.SET_CONTACTS: {
            return { ...state, contacts: action.payload || [] };
        }
        case APP.SET_SHOW_CONTACTS_MODAL: {
            return { ...state, show_contacts_modal: action.payload || false };
        }
        case APP.SET_SHOW_INVITE_CONTACTS_FRIEND_MODAL: {
            return { ...state, show_invite_contacts_friend_modal: action.payload || false };
        }
        case APP.SET_SHOW_INVITE_MUTUAL_FRIEND_MODAL: {
            return {
                ...state,
                show_invite_mutual_friend_modal: action.show || false,
                invite_mutual_friends: action.data || []
            };
        }
        case APP.SET_SHOW_REMIND_EARNINVITE_MODAL: {
            return { ...state, show_remind_earn_invite_modal: action.payload || false };
        }
        case APP.SET_SHOW_REMIND_REFERRAL_MODAL: {
            return { ...state, show_remind_referral_modal: action.payload || false };
        }
        case APP.SET_SHOW_ORDER_NOW_MODAL: {
            return { ...state, show_order_now_modal: action.payload || false };
        }
        case APP.SET_ASKED_CONTACTS_PERMISSION: {
            return { ...state, asked_contacts_permission: action.payload || false };
        }
        case APP.SET_ASKED_INTERESTS: {
            return { ...state, asked_interests: action.payload || false };
        }
        case APP.SET_SHARED_INFORMATION: {
            return {
                ...state,
                shared_mime_type: action.payload.mimeType || null,
                shared_content: action.payload.sharedContent || [],
                isSharingVisible: true,
            };
        }
        case APP.SET_LINKED_REFFERAL_CODE: {
            return {
                ...state,
                linkedRefferalCode: action.payload.refferalCode || null,
            };
        }
        case APP.REMOVE_LINKED_REFFERAL_CODE: {
            return {
                ...state,
                linkedRefferalCode: null,
            };
        }
        case APP.REMOVE_SHARED_INFORMATION: {
            return {
                ...state,
                shared_mime_type: null,
                shared_content: [],
                isSharingVisible: false,
            };
        }

        case APP.SET_INVITE_PICKED_USER: {
            return { ...state, invitationPickedUser: action.payload };
        }

        case APP.SET_BALANCE_TRANSFER_PICKED_USER: {
            return { ...state, balanceTransferPickedUser: action.payload };
        }

        case APP.SET_GIFT_ORDER_PICKED_USER: {
            return { ...state, giftOrderPickedUser: action.payload };
        }

        case APP.SET_INVITATION_REWARDS: {
            return { ...state, invitationRewardsSetting: action.payload };
        }

        case APP.SET_REFERRALS_REWARDS: {
            return { ...state, referralsRewardsSetting: action.payload };
        }

        case APP.SET_MEMBERSHIP_SETTING: {
            return { ...state, membershipSetting: action.payload || {} };
        }
        
        case APP.SET_TMP_PICKED_MEMBERSHIP_PLAN: {
            return { ...state, tmpPickedMembershipPlan: action.payload || MEMBERSHIP_PLANS.monthly };
        }

        case APP.SET_INVITATION_TIMER_SETTING: {
            return { ...state, invitationTimerSetting: action.payload };
        }

        case APP.SET_ALL_ACTIVE_VENDORS: {
            return {
                ...state,
                active_vendors: action.payload || [],
            };
        }

        case APP.SET_UNCONFIRMED_DELIVERY_ORDER: {
            return {
                ...state,
                unconfirmedDeliveryOrders: action.payload || [],
            };
        }

        case APP.SET_ALL_FRIENDS: {
            return {
                ...state,
                all_friends: action.payload || [],
            };
        }

        case APP.SET_DIFF_LOCATION_TOOLTIP: {
            return {
                ...state,
                home_diff_location_tooltip: action.payload,
            };
        }

        case APP.SET_APP_FEEDBACK_TAGS: {
            return {
                ...state,
                feedback_where_tags: action.payload || [],
            };
        }
        case APP.SET_SHOW_WHERE_HEARD_FEEDBACK_MODAL: {
            return { ...state, show_feedback_where_heard_modal: action.payload || false };
        }

        case APP.SET_APP_ANNOUNCE_DATA: {
            return {
                ...state,
                announce_data: action.payload || {},
            };
        }
        case APP.SET_SHOW_ANNOUNCE_MODAL: {
            return { ...state, show_announce_modal: action.payload || false };
        }

        case APP.SET_SYSTEM_SETTINGS: {
            return { ...state, systemSettings: action.payload || {} };
        }

        case APP.SET_STUDENT_VERIFY_SETTINGS: {
            return { ...state, studentVerifySettings: action.payload || {} };
        }

        case APP.SET_ACTIVE_ROUTE:
            return { ...state, activeRoute: action.payload };

        case APP.SET_HOME_SCROLLER:
            return { ...state, homeScroller: action.payload };

        case APP.SET_VENDOR_IDS_TMP: {
            return { ...state, vendor_ids_tmp: action.payload || [] };
        }

        case APP.SET_BANNER_PROMOTION: {
            return { ...state, banner_promotion: action.payload };
        }
        case APP.SET_STUDENT_BANNER_PROMOTION: {
            return { ...state, student_banner_promotion: action.payload };
        }

        case APP.SET_ALL_PROMO_BANNERS: {
            return { ...state, all_banners: action.payload || [] };
        }

        default:
            return { ...state };
    }
};