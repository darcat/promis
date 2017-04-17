var React = require('react');
var Bootstrap = require('react-bootstrap');

var Row = Bootstrap.Row;
var Well = Bootstrap.Well;


var Nav = require('./Nav');
var Panel = require('./Panel');

class App extends React.Component {
    constructor(props) {
        super(props);
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
                        <Panel>Panel one</Panel>
                        <Panel>Panel two</Panel>
                    </Row>
                    <Row>
                        <Panel>Panel three</Panel>
                        <Panel>Panel four</Panel>
                    </Row>
                </div>
            </div>
        )
    }
}

module.exports = App;
