import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Well } from 'react-bootstrap';

import Nav from '../components/Nav';
import Panel from '../components/Panel';

import mapActionsCreators from '../actions/Map';
import genActionsCreators from '../actions/Generic';
import selActionsCreators from '../actions/Selection';

import MapPanel from '../components/UniversalMap';
import TimeAndPositionPanel from '../components/TimeAndPosition';

import Quicklook from '../components/Quicklook';

class App extends Component {
    constructor(props) {
        super(props);

        /* local state and two callbacks are faster than redux loop */
        this.state = {
            selectionPreview: [0.0, 0.0] /* next selection point */
        }

        this.updatePreview = this.updatePreview.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
    }

    componentDidMount() {
        this.updateDimensions();

        window.addEventListener('resize', this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions.bind(this));
    }

    updatePreview(newPreview) {
        this.setState(function(){
            return {
                selectionPreview: newPreview
            }
        });
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
                <Nav />
                <div style = {style}>
                    <Well bsSize="large">
                        <h3>Ionosat PROMIS</h3>
                        <p>We are glad to welcome you on this page. Please use the filters below to refine your search!</p>
                    </Well>
                    <Row>
                        <TimeAndPositionPanel
                            preview = {this.state.selectionPreview}
                            options = {this.props.inputOptions}
                            selection = {this.props.selection}
                            selectionActions = {this.props.selActions}
                            genericActions = {this.props.genActions}
                        />
                        <Panel>Panel two</Panel>
                    </Row>
                    <Row>
                        { this.props.inputOptions.mapEnabled &&
                        <MapPanel
                            onPreview = {this.updatePreview}
                            selection = {this.props.selection}
                            options = {this.props.mapOptions}
                            mapActions = {this.props.mapActions}
                            selectionActions = {this.props.selActions}
                        />
                        }
                        <Panel>some panel</Panel>
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
        selection: state.Selection
    }
}

/* Bind actions(events) to dispatch (allow event flow via Redux */
function mapDispatchToProps(dispatch) {
    return {
        mapActions : bindActionCreators(mapActionsCreators, dispatch),
        genActions : bindActionCreators(genActionsCreators, dispatch),
        selActions : bindActionCreators(selActionsCreators, dispatch)
    }
}

/* connect to Redux and export */
export default connect(mapStateToProps, mapDispatchToProps)(App);
