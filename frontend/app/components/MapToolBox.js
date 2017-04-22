import React, { Component } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import ToolboxButton from './ToolboxButton';

export default class MapToolBox extends Component {
    constructor(props) {
        super(props);

        this.actions = props.onChange;

        /* more this please... */
        this.toggleFlat = this.toggleFlat.bind(this);
        this.toggleFull = this.toggleFull.bind(this);
        this.toggleGrid = this.toggleGrid.bind(this);
    }

    toggleFlat() {
        this.actions.toggleFlat(! this.props.options.flat);
    }

    toggleFull() {
        this.actions.toggleFullscreen(! this.props.options.full);
    }

    toggleGrid() {
        this.actions.toggleGrid(! this.props.options.grid);
    }

    render() {
        var opts = this.props.options;

        return (
            <div className = 'mapToolBox'>
                <ButtonGroup className = 'innerToolBox'>
                    <ToolboxButton onClick = {this.toggleFlat} active = {! opts.flat} icon = 'globe' help = {'Switch to ' + (opts.flat ? '3D' : '2D')} />
                    <ToolboxButton icon = 'edit' help = 'Select area' />
                    <ToolboxButton icon = 'screenshot' help = 'Select area' />
                    <ToolboxButton onClick = {this.toggleGrid} active = {opts.grid} icon = 'th' help = 'Toggle grid' />
                    <ToolboxButton onClick = {this.toggleFull} icon = {opts.full ? 'resize-small' : 'resize-full'} help = {opts.full ? 'Minimize' : 'Fullscreen'} />
                    { this.props.hasSelection &&
                    <div>
                    <ToolboxButton icon = 'erase' help = 'Erase last selection' />
                    <ToolboxButton icon = 'ban-circle' help = 'Clear all selection' />
                    </div>
                    }
                </ButtonGroup>
            </div>
        )
    }
}
