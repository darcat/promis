import { combineReducers } from 'redux';

import Map from './Map';
import User from './User';
import REST from './REST';
import Search from './Search';
import Selection from './Selection';

export default combineReducers({ Map, User, REST, Search, Selection });
