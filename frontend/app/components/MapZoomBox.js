var React = require('react');
var Bootstrap = require('react-bootstrap');

var ToolboxButton = require('./ToolboxButton');
var ButtonGroup = Bootstrap.ButtonGroup;

class MapZoomBox extends React.Component {
    constructor(props) {
        super(props);

        this.minZoom = props.minZoom;
        this.maxZoom = props.maxZoom;
        this.onChange = props.onChange;

        this.state = {
            zoom: props.zoom || props.defaultZoom
        }

        this.x = 0;

        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
    }

    zoomIn() {
        var newZoom = this.state.zoom + 1;

        if(this.state.zoom < this.maxZoom) this.setState(function() {
            return {
                zoom: newZoom
            }
        }, this.onChange(newZoom));
    }

    zoomOut() {
        var newZoom = this.state.zoom - 1;

        if(this.state.zoom > this.minZoom) this.setState(function() {
            return {
                zoom: newZoom
            }
        }, this.onChange(newZoom));
    }

    render() {
        return (
            <div className = 'mapzoombox'>
                <ButtonGroup vertical>
                    <ToolboxButton placement = 'right' onClick = {this.zoomIn} disabled = {this.state.zoom == this.maxZoom} icon = 'plus' help = 'Zoom in' />
                    <ToolboxButton placement = 'right' onClick = {this.zoomOut} disabled = {this.state.zoom == this.minZoom} icon = 'minus' help = 'Zoom out' />
                </ButtonGroup>
            </div>
        )
    }
}

MapZoomBox.defaultProps = {
    minZoom: 1,
    maxZoom: 15,
    defaultZoom: 5,
    onChange: function() { ; }
}

module.exports = MapZoomBox;