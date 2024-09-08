import {APP} from '../types';

const INITIAL_STATE = {
    favourites: [],
    allFavourites: [],
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case APP.SET_FAVOURITES: {
            return {
                ...state,
                favourites: action.payload,
            };
        }
        case APP.SET_ALL_FAVOURITES: {
            return {
                ...state,
                allFavourites: action.payload,
            };
        }
        default:
            return {...state};
    }
};

