import {APP} from '../types';

const INITIAL_STATE = {
	channelId: null,
	chat_channels: [],
	call_channels: [],
	user: {},
	messages: [],
	new_invites: [],
	newMessagesNr: 0,
	userCanEnterChat: false,
	isChannelLoading: false,
	isLoadingChat: false,
	messagesByChannel: {},
	isStoryImgPickModal: false,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
		case APP.SET_MESSAGES_BY_CHANNEL: {
			return {
				...state,
				messagesByChannel: { ...state.messagesByChannel,[action.payload.key]:action.payload.messages },
			};
		}
		case APP.INIT_CHANNEL_SUCCESS: {
			return {
				...state,
				channelId: action.payload,
				isChannelLoading: false,
			};
		}
		case APP.SET_CHANNELS: {
			return {
				...state,
				chat_channels: action.payload || [],
			};
		}
		case APP.SET_OPEN_STORY_IMG_PICK_MODAL: {
			return {
				...state,
				isStoryImgPickModal: action.payload || false,
			};
		}
		case APP.SET_CHANNELS_LOADING: {
			return {
				...state,
				isLoadingChat: action.payload || false,
			};
		}
		case APP.SET_CALL_CHANNELS: {
			return {
				...state,
				call_channels: action.payload || [],
			};
		}
		case APP.SET_NEW_INVITES:
			return { ...state, new_invites: action.payload };
		case APP.INIT_CHAT_ROOM_ERROR: {
			return {
				...state,
				isChannelLoading: false,
			};
		}
		case APP.INIT_CHAT_ROOM_STARTED: {
			return {
				...state,
				isChannelLoading: true,
			};
		}
		case APP.NEW_MESSAGE_ARRIVED: {
			const isNew = !action.data.seen && action.data.user._id !== state.user.id ? 1 : 0;
			const { messages } = state;
			const exists = messages.find((m) => action.data._id === m._id);
			if (!exists) {
				return {
					...state,
					newMessagesNr: state.newMessagesNr + isNew,
					messages: [action.data, ...state.messages],
				};
			}
			return state;
		}
		case APP.MESSAGE_IS_MODIFIED: {
			const newMessagesState = state.messages.map((message) =>
				message._id === action.data._id ? action.data : message
			);
			const newMessagesNr = newMessagesState.filter(
				(message) => !message.seen && message.user._id !== state.user.id
			).length;
			return {
				...state,
				messages: newMessagesState,
				newMessagesNr,
			};
		}
		case APP.USER_LOGGED_OUT: {
			return INITIAL_STATE;
		}
		case APP.ENTER_CHAT: {
			return {
				...state,
				userCanEnterChat: true,
			};
		}
		default:
			return { ...state };
	}
};

