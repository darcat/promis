var React = require('react');
var Bootstrap = require('react-bootstrap');
var Draggable = require('react-draggable');

var Col = Bootstrap.Col;
var Accordion = Bootstrap.Accordion;
var BootstrapPanel = Bootstrap.Panel;

require(__dirname + '/../styles/panel.css');

class Panel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Draggable handle = '.panel-title'>
                <Col md={6} sm={12}>
                    <BootstrapPanel className = {this.props.className} header = {this.props.title}>{this.props.children}</BootstrapPanel>
                </Col>
            </Draggable>
        );

        /*
        return (
            <Draggable handle = '.panel-title'>
                <Col md={6} sm={12}>
                    <Accordion>
                        
                    </Accordion>
                </Col>
            </Draggable>
        )*/
    }
}

Panel.defaultProps = {
    title: 'Panel title'
}

module.exports = Panel;