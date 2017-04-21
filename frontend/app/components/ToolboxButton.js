var React = require('react');
var Bootstrap = require('react-bootstrap');

var Button = Bootstrap.Button;
var Tooltip = Bootstrap.Tooltip;
var Glyphicon = Bootstrap.Glyphicon;
var ButtonGroup = Bootstrap.ButtonGroup;
var OverlayTrigger = Bootstrap.OverlayTrigger;

class ToolboxButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.tooltip = (<Tooltip id="tooltip">{this.props.help}</Tooltip>);

        return (
            <OverlayTrigger placement = {this.props.placement} overlay = {this.tooltip}>
                <Button onClick = {this.props.onClick} active = {this.props.active} disabled = {this.props.disabled} bsStyle = 'default' bsSize = 'small'>
                    <Glyphicon glyph = {this.props.icon} />
                </Button>
            </OverlayTrigger>
        );
    }
}

ToolboxButton.defaultProps = {
    help : 'Tooltip text',
    icon : 'star',
    placement: 'bottom',
    onClick : function() { ; }
}

module.exports = ToolboxButton;