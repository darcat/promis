var React = require('react');
var Bootstrap = require('react-bootstrap');

var GeoObject = require('../utils/GeoObject.js');

var Button = Bootstrap.Button;
var Tooltip = Bootstrap.Tooltip;
var Glyphicon = Bootstrap.Glyphicon;
var ButtonGroup = Bootstrap.ButtonGroup;
var OverlayTrigger = Bootstrap.OverlayTrigger;

class ToolboxButton extends React.Component {
    constructor(props) {
        super(props);

        this.tooltip = (<Tooltip id="tooltip">{this.props.help}</Tooltip>);
    }

    render() {
        return (
            <OverlayTrigger placement="bottom" overlay={this.tooltip}>
                <Button onClick = {this.props.onClick} bsStyle = 'default'>
                    <Glyphicon glyph = {this.props.icon} />
                </Button>
            </OverlayTrigger>
        );
    }
}

ToolboxButton.defaultProps = {
    help : 'Tooltip text',
    icon : 'star',
    onClick : function() { ; }
}

 
class MapToolbox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fullscreen : false
        }
    }

    render() {
        return (
            <div className = 'maptoolbox'>
                <ButtonGroup>
                    <ToolboxButton icon = 'globe' help = 'Switch to 3D' />
                    <ToolboxButton icon = 'edit' help = 'Select area' />
                    <ToolboxButton icon = 'screenshot' help = 'Select area' />
                    <ToolboxButton icon = 'th' help = 'Select area' />
                    <ToolboxButton icon = 'resize-full' help = 'Fullscreen' />
                    <ToolboxButton icon = 'erase' help = 'Erase last selection' />
                    <ToolboxButton icon = 'ban-circle' help = 'Clear all selection' />
                </ButtonGroup>
            </div>
        )
    }
}

class MapZoomBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className = 'mapzoombox'>
                <ButtonGroup vertical>
                    <ToolboxButton icon = 'plus' help = 'Zoom in' />
                    <ToolboxButton icon = 'minus' help = 'Zoom out' />
                </ButtonGroup>
            </div>
        )
    }
}

class UniversalMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            flat: true
        }

        this.go = new GeoObject();
        //this.go.init('#');
    }

    render() {
        return (
            <div>
                <MapZoomBox />
                <MapToolbox />

                { this.state.flat ? (
                <div id = 'leaflet'></div>
                ) : (
                <div id = 'cesium'></div>
                ) }
            </div>
        );
    }
}


module.exports = UniversalMap;