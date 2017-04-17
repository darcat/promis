var React = require('react');
var Bootstrap = require('react-bootstrap').Button;

var Nav = require('./Nav.js');

class App extends React.Component {
    render() {
        return (
            <div>
                <Nav />
            </div>
        )
    }
}

module.exports = App;
