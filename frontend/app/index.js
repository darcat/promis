var React = require('react');
var Redux = require('redux');
var ReactDom = require('react-dom');
var Ready = require('document-ready');

var Thunk = require('redux-thunk').default;
var Provider = require('react-redux').Provider;

var App = require('./containers/App');
var RootReducer = require('./reducers/Root');

/* bootstrap */
require('bootstrap/dist/css/bootstrap.css');
require('bootstrap/dist/css/bootstrap-theme.css');

/* bootstrap toggle */
require('react-bootstrap-toggle/dist/bootstrap2-toggle.css');

var BuildModuleUrl = require('cesium/Source/Core/buildModuleUrl');
BuildModuleUrl.setBaseUrl('./');

/* create Redux store */
var store = Redux.createStore(
	RootReducer,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
	Redux.applyMiddleware(Thunk));


Ready(function() {
	ReactDom.render(
		<Provider store = {store}>
			<App />
		</Provider>,
	document.getElementById('app'));
})
