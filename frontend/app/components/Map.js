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
            <OverlayTrigger placement = {this.props.placement} overlay = {this.tooltip}>
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
    placement: 'bottom',
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
                    <ToolboxButton icon = 'th' help = 'Toggle grid' />
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

        this.minZoom = props.minZoom;
        this.maxZoom = props.maxZoom;

        this.state = {
            zoom: props.defaultZoom
        }

        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
    }

    zoomIn() {
        this.setState(function() {
            return {
                zoom: (this.state.zoom < this.maxZoom ? this.state.zoom + 1 : this.maxZoom)
            }
        })
    }

    zoomOut() {
        this.setState(function() {
            return {
                zoom: (this.state.zoom > this.minZoom ? this.state.zoom - 1 : this.minZoom)
            }
        })
    }

    render() {
        return (
            <div className = 'mapzoombox'>
                <ButtonGroup vertical>
                    <ToolboxButton placement = 'right' onClick = {this.zoomIn} icon = 'plus' help = 'Zoom in' />
                    <ToolboxButton placement = 'right' onClick = {this.zoomOut} icon = 'minus' help = 'Zoom out' />
                </ButtonGroup>
            </div>
        )
    }
}

MapZoomBox.defaultProps = {
    minZoom: 1,
    maxZoom: 15,
    defaultZoom: 5
}

function LeafletContainer(props) {
    return (<div>hello im leaflet</div>)
}

function CesiumContainer(props) {
    return (<div>hello im cesium</div>)
}

class UniversalMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            flat: true,      /* true for leaflet, false for cesium */
            selection: [],    /* active selection */
            location: { /* current location */
                lat: null,
                lng: null,
                zoom: 5
            }
        }

        //this.go = new GeoObject();
        //this.go.init('#');
        this.updateMap = this.updateMap.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
        this.handleTools = this.handleTools.bind(this);
    }

    updateMap() {

    }

    handleZoom() {

    }

    handleTools() {

    }

    render() {
        return (
            <div>
                <MapZoomBox onChange = {this.handleZoom} />
                <MapToolbox onChange = {this.handleTools} />

                { this.state.flat ? (
                <LeafletContainer onChange = {this.updateMap} location = {this.state.location} selection = {this.state.selection} />
                ) : (
                <CesiumContainer onChange = {this.updateMap} location = {this.state.location} selection = {this.state.selection} />
                ) }
            </div>
        );
    }
}


module.exports = UniversalMap;