import {combineReducers} from 'redux';

import app from './app';
import chat from './chat';
import shop from './shop';
import vendors from './vendors';

export default combineReducers({
    app,
    chat,
    shop,
    vendors,
});
