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

        this.updateDimensions = this.updateDimensions.bind(this);
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
                <Nav />
                <div style = {style}>
                    <Well bsSize="large">
                        <h3>Ionosat PROMIS</h3>
                        <p>We are glad to welcome you on this page. Please use the filters below to refine your search!</p>
                    </Well>
                    <Row>
                        <TimeAndPositionPanel 
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
                            selection = {this.props.selection}
                            options = {this.props.mapOptions}
                            actions = {this.props.mapActions}
                        />
                        }
                        <Panel><Quicklook data={[0,1,3,-5,3,5,6,7,8,8,3,1,1,4,5,6,3,2,4,16,-12,6,3,2,1]}/></Panel>
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
