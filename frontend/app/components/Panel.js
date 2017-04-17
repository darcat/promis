var React = require('react');
var Bootstrap = require('react-bootstrap');
var Draggable = require('react-draggable');

var Col = Bootstrap.Col;
var Accordion = Bootstrap.Accordion;
var BootstrapPanel = Bootstrap.Panel;

class Panel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Draggable>
                <Col md={6} sm={12}>
                    <Accordion>
                        <BootstrapPanel header = {this.props.title}>{this.props.children}</BootstrapPanel>
                    </Accordion>
                </Col>
            </Draggable>
        )
    }
}

Panel.defaultProps = {
    title: 'Panel title'
}

module.exports = Panel;