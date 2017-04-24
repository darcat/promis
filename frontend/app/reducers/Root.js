import { combineReducers } from 'redux';

import Map from './Map';
import User from './User';
import REST from './REST';
import Generic from './Generic';
import Selection from './Selection';

export default combineReducers({ Map, User, REST, Generic, Selection });
