import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import thunk from 'redux-thunk'

import Ready from 'document-ready';

import App from './containers/App';
import RootReducer from './reducers/Root';

/* bootstrap */
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

/* bootstrap toggle */
import 'react-bootstrap-toggle/dist/bootstrap2-toggle.css';

/* setup cesium */
import BuildModuleUrl from 'cesium/Source/Core/buildModuleUrl';
BuildModuleUrl.setBaseUrl('./');

/* create Redux store */
var store = createStore(
	RootReducer,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
	applyMiddleware(thunk));

Ready(function() {
	render(
		<Provider store = {store}>
			<App />
		</Provider>,
	document.getElementById('app'));
});
