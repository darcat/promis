var Redux = require('redux');

var Map = require('./Map');
var User = require('./User');
var Generic = require('./Generic');

module.exports = Redux.combineReducers({ Map, User, Generic });
