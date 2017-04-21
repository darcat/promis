var React = require('react');
var Bootstrap = require('react-bootstrap');
var Draggable = require('react-draggable');

var Col = Bootstrap.Col;
var Accordion = Bootstrap.Accordion;
var BootstrapPanel = Bootstrap.Panel;

require(__dirname + '/../styles/panel.css');

// TODO: separate click collapse handler and drag toggling
// { !this.props.disableDrag ? (<Draggable handle = '.panel-title'>) : ()}

class Panel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Col md={6} sm={12}>
                <BootstrapPanel className = {this.props.className} header = {this.props.title}>{this.props.children}</BootstrapPanel>
            </Col>
        )
    }
}

Panel.defaultProps = {
    title: 'Panel title'
}

module.exports = Panel;