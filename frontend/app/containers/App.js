import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row } from 'react-bootstrap';

import Nav from '../components/Nav';
import Panel from '../components/Panel';

import mapActionsCreators from '../actions/Map';
import usrActionsCreators from '../actions/User';
import rstActionsCreators from '../actions/REST';
import genActionsCreators from '../actions/Generic';
import selActionsCreators from '../actions/Selection';

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

        this.props.usrActions.profile();
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
                <Nav actions = {this.props.usrActions} userData = {this.props.userData} />
                <div style = {style}>
                    <Row>
                        <TimeAndPositionPanel
                            ee = {this.ee}
                            options = {this.props.inputOptions}
                            selection = {this.props.selection}
                            selectionActions = {this.props.selActions}
                            genericActions = {this.props.genActions}
                        />
                        <Panel title = 'Search'>
                            <SearchForm
                                storage = {this.props.storage}        /* generic storage for api data */
                                options = {this.props.inputOptions}   /* general options, datetime, etc */
                                mapped  = {this.props.mapActions}     /* for geoline management */
                                actions = {this.props.rstActions}     /* api-related actions */
                                generic = {this.props.genActions}     /* for setting time back */
                                selected = {this.props.selActions}    /* for flushing selection */
                                selection = {this.props.selection}    /* selection array */
                            />
                        </Panel>
                    </Row>
                    <Row>
                        <MapPanel
                            ee = {this.ee}
                            selection = {this.props.selection}
                            options = {this.props.mapOptions}
                            mapActions = {this.props.mapActions}
                            selectionActions = {this.props.selActions}
                        />
                        <Panel title = 'Search results' className = 'margined'>
                            <SearchResults
                                results = {this.props.storage.measurements}
                                options = {this.props.inputOptions}
                                storage = {this.props.storage}
                                actions = {this.props.rstActions}
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
        inputOptions: state.Generic,
        mapOptions: state.Map,
        selection: state.Selection,
        userData: state.User,
        storage: state.REST
    }
}

/* Bind actions(events) to dispatch (allow event flow via Redux */
function mapDispatchToProps(dispatch) {
    return {
        mapActions : bindActionCreators(mapActionsCreators, dispatch),
        genActions : bindActionCreators(genActionsCreators, dispatch),
        selActions : bindActionCreators(selActionsCreators, dispatch),
        rstActions : bindActionCreators(rstActionsCreators, dispatch),
        usrActions : bindActionCreators(usrActionsCreators, dispatch)
    }
}

/* connect to Redux and export */
export default connect(mapStateToProps, mapDispatchToProps)(App);
