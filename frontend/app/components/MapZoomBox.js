import React, { Component } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import ToolboxButton from './ToolboxButton';

export default class MapZoomBox extends Component {
    constructor(props) {
        super(props);

        this.minZoom = props.minZoom;
        this.maxZoom = props.maxZoom;
        this.onChange = props.onChange;

        this.state = {
            zoom: props.zoom || props.defaultZoom
        }

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
            <div className = 'mapZoomBox'>
                <ButtonGroup className = 'innerToolBox' vertical>
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
