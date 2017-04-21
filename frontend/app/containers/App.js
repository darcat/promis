import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Well } from 'react-bootstrap';

import Nav from '../components/Nav';
import Panel from '../components/Panel';

import mapActionsCreators from '../actions/Map';
import genActionsCreators from '../actions/Generic';

import MapPanel from '../components/UniversalMap';
import TimeAndPositionPanel from '../components/TimeAndPosition';


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0
        };

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();

        window.addEventListener('resize', this.updateWindowDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions.bind(this));
    }

    updateWindowDimensions() {
        /* pass new size to map */
        var dims = new Array(window.innerWidth, window.innerHeight);

        this.props.mapActions.toggleDims(dims);
    }

    render() {
        return (
            <div>
                <Nav />
                <div style = {{ width: '95%', margin: '0 auto' }}>
                    <Well bsSize="large">
                        <h3>Ionosat PROMIS</h3>
                        <p>We are glad to welcome you on this page. Please use the filters below to refine your search</p>
                    </Well>
                    <Row>
                        
                            <TimeAndPositionPanel options = {this.props.inputOptions} selection = {this.props.selection} actions = {this.props.genActions} />
                        
                        <Panel>Panel two</Panel>
                    </Row>
                    <Row>
                        { this.props.inputOptions.mapEnabled &&
                        <MapPanel
                            fullheight = {this.state.height}
                            fullwidth = {this.state.width}
                            selection = {this.props.selection}
                            options = {this.props.mapOptions}
                            actions = {this.props.mapActions}
                        />
                        }
                        <Panel>Panel four</Panel>
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
        selection: state.Map.selection
    }
}

/* Bind actions(events) to dispatch (allow event flow via Redux */
function mapDispatchToProps(dispatch) {
    return {
        mapActions : bindActionCreators(mapActionsCreators, dispatch),
        genActions : bindActionCreators(genActionsCreators, dispatch)
    }
}

/* connect to Redux and export */
export default connect(mapStateToProps, mapDispatchToProps)(App);
