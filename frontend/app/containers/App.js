var React = require('react');
var Redux = require('redux');
var Bootstrap = require('react-bootstrap');
var ReactRedux = require('react-redux');


var Nav = require('../components/Nav');
var Panel = require('../components/Panel');

var mapActionsCreators = require('../actions/Map');
var genActionsCreators = require('../actions/Generic');

var MapPanel = require('../components/UniversalMap');
var TimeAndPositionPanel = require('../components/TimeAndPosition');

var Row = Bootstrap.Row;
var Well = Bootstrap.Well;

class App extends React.Component {
    constructor(props) {
        super(props);

        this.handleTimeAndPosition = this.handleTimeAndPosition.bind(this);
    }

    handleTimeAndPosition() {
        console.log('time and position changed');
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
                        <MapPanel options = {this.props.mapOptions} selection = {this.props.selection} actions = {this.props.mapActions} />
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
        mapActions : Redux.bindActionCreators(mapActionsCreators, dispatch),
        genActions : Redux.bindActionCreators(genActionsCreators, dispatch)
    }
}

/* connect to Redux and export */
module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(App)
