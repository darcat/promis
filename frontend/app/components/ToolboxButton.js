import React, { Component } from 'react';
import { Button, Tooltip, Glyphicon, ButtonGroup, OverlayTrigger } from 'react-bootstrap';

export default class ToolboxButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.tooltip = (<Tooltip id="tooltip">{this.props.help}</Tooltip>);

        return (
            <OverlayTrigger placement = {this.props.placement} overlay = {this.tooltip}>
                <Button
                    onClick = {this.props.onClick}
                    active = {this.props.active}
                    disabled = {this.props.disabled}
                    bsStyle = {this.props.style}
                    bsSize = 'small'
                >
                    <Glyphicon glyph = {this.props.icon} />
                </Button>
            </OverlayTrigger>
        );
    }
}

ToolboxButton.defaultProps = {
    help : 'Tooltip text',
    icon : 'star',
    style: 'default',
    placement: 'bottom',
    onClick : function() { ; }
}
