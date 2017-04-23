import React, { Component } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import ToolboxButton from './ToolboxButton';

export default class MapToolBox extends Component {
    constructor(props) {
        super(props);

        this.select = props.onSelect;
        this.actions = props.onChange;

        /* more this please... */
        this.toggleFlat = this.toggleFlat.bind(this);
        this.toggleFull = this.toggleFull.bind(this);
        this.toggleGrid = this.toggleGrid.bind(this);
        this.toggleRect = this.toggleRect.bind(this);
        this.togglePoly = this.togglePoly.bind(this);
        this.toggleRound = this.toggleRound.bind(this);
        this.toggleSelect = this.toggleSelect.bind(this);
    }

    toggleSelect(currentState) {
        if(currentState) {
            this.select.startSelection();
        } else {
            this.select.finishSelection();
        }
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

    /* just tool */
    togglePoly(polyState) {
        this.toggleSelect(polyState);
        this.actions.togglePoly(polyState);
    }

    /* related tool */
    toggleRect(rectState) {
        if(this.props.options.round) {
            this.toggleSelect(false);
            this.actions.toggleRound(false);
        }

        this.toggleSelect(rectState);
        this.actions.toggleRect(rectState);
    }

    /* related tool */
    toggleRound(roundState) {
        if(this.props.options.rect) {
            this.toggleRect(false);
        }

        this.toggleSelect(roundState);
        this.actions.toggleRound(roundState);
    }


    render() {
        var opts = this.props.options;

        return (
            <div className = 'mapToolBox'>
                <ButtonGroup className = 'innerToolBox'>
                    <ToolboxButton onClick = {this.toggleFlat} active = {! opts.flat} icon = 'globe' help = {'Switch to ' + (opts.flat ? '3D' : '2D')} />
                    { opts.flat ? ( [
                        <ToolboxButton key = {1} onClick = {this.toggleRect.bind(null, ! opts.rect)} active = {opts.rect} icon = 'unchecked' help = 'Select rectangular area' />,
                        <ToolboxButton key = {2} onClick = {this.toggleRound.bind(null, ! opts.round)} active = {opts.round} icon = 'record' help = 'Select circular area' />
                    ]) : ([
                        <ToolboxButton key = {1} onClick = {this.togglePoly.bind(null, ! opts.poly)} active = {opts.poly} icon = 'screenshot' help = 'Select polygonal area' />
                    ]) }
                    <ToolboxButton onClick = {this.toggleGrid} active = {opts.grid} icon = 'th' help = 'Toggle grid' />
                    <ToolboxButton onClick = {this.toggleFull} icon = {opts.full ? 'resize-small' : 'resize-full'} help = {opts.full ? 'Minimize' : 'Fullscreen'} />
                    { this.props.hasSelection ? ([
                        <ToolboxButton key = {1} icon = 'erase' help = 'Erase last selection' />,
                        <ToolboxButton key = {2} icon = 'ban-circle' help = 'Clear all selection' />
                    ]) : ([]) }
                </ButtonGroup>
            </div>
        );
    }
}
