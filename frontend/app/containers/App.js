import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Well } from 'react-bootstrap';

import Nav from '../components/Nav';
import Panel from '../components/Panel';

import mapActionsCreators from '../actions/Map';
import userActionsCreators from '../actions/User';
import RESTActionsCreators from '../actions/REST';
import searchActionsCreators from '../actions/Search';
import selectionActionsCreators from '../actions/Selection';

import MapPanel from '../components/UniversalMap';
import TimeAndPositionPanel from '../components/TimeAndPosition';

import SearchForm from '../components/SearchForm.js';
import SearchResults from '../components/SearchResults.js';

import EventEmitter from 'event-emitter';

class App extends Component {
    constructor(props) {
        super(props);

        /* redux is too slow here */
        this.ee = new EventEmitter();

        this.updateDimensions = this.updateDimensions.bind(this);

        this.props.userActions.profile();
    }

    componentDidMount() {
        this.updateDimensions();

        window.addEventListener('resize', this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions.bind(this));
    }

    updateDimensions() {
        /* pass new size to map */
        var dims = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        this.props.mapActions.toggleDims(dims);
    }

    render() {
        var style = {
            width: '95%',
            margin: '0 auto'
        };

        /* hide possible scrollbar when resizing to ultralow dimensions in fullscreen mode */
        document.body.style.overflow = (this.props.mapOptions.full ? 'hidden' : null);

        return (
            <div>
                <Nav actions = {this.props.userActions} userData = {this.props.userData} />
                <div style = {style}>
                    <Well bsSize="large">
                        <h3>Ionosat PROMIS</h3>
                        <p>We are glad to welcome you on this page. Please use the filters below to refine your search!</p>
                    </Well>
                    <Row>
                        <TimeAndPositionPanel
                            ee = {this.ee}
                            options = {this.props.searchOptions}
                            selection = {this.props.selection}
                            selectionActions = {this.props.selectionActions}
                            searchActions = {this.props.searchActions}
                        />
                        <Panel title = 'Search'>
                            <SearchForm
                                storage = {this.props.storage}        /* generic storage for api data */
                                options = {this.props.searchOptions}   /* general options, datetime, etc */
                                mapped  = {this.props.mapActions}     /* for geoline management */
                                actions = {this.props.RESTActions}     /* api-related actions */
                                search = {this.props.searchActions}     /* for setting time back */
                                selected = {this.props.selectionActions}    /* for flushing selection */
                                selection = {this.props.selection}    /* selection array */
                            />
                        </Panel>
                    </Row>
                    <Row>
                        { this.props.searchOptions.useMap &&
                        <MapPanel
                            ee = {this.ee}
                            selection = {this.props.selection}
                            options = {this.props.mapOptions}
                            mapActions = {this.props.mapActions}
                            selectionActions = {this.props.selectionActions}
                        />
                        }
                        <Panel title = 'Search results' className = 'margined'>
                            <SearchResults
                                results = {this.props.storage.measurements}
                                options = {this.props.searchOptions}
                                storage = {this.props.storage}
                                actions = {this.props.RESTActions}
                            />
                        </Panel>
                    </Row>
                </div>
            </div>
        )
    }
}

/* Redux state to App props */
function mapStateToProps(state) {
    return {
        searchOptions: state.Search,
        mapOptions: state.Map,
        selection: state.Selection,
        userData: state.User,
        storage: state.REST
    }
}

/* Bind actions(events) to dispatch (allow event flow via Redux */
function mapDispatchToProps(dispatch) {
    return {
        mapActions       : bindActionCreators(mapActionsCreators, dispatch),
        searchActions    : bindActionCreators(searchActionsCreators, dispatch),
        selectionActions : bindActionCreators(selectionActionsCreators, dispatch),
        RESTActions      : bindActionCreators(RESTActionsCreators, dispatch),
        userActions      : bindActionCreators(userActionsCreators, dispatch)
    }
}

/* connect to Redux and export */
export default connect(mapStateToProps, mapDispatchToProps)(App);
