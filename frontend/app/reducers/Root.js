import { combineReducers } from 'redux';

import Map from './Map';
import User from './User';
import Generic from './Generic';
import Selection from './Selection';

export default combineReducers({ Map, User, Generic, Selection });
