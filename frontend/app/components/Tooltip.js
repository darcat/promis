import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default class CustomTooltip extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var tooltip = (<Tooltip id="tooltip">{this.props.text}</Tooltip>);

        return (
            <OverlayTrigger placement = {this.props.placement} overlay = {tooltip}>
                {this.props.children}
            </OverlayTrigger>
        )
    }
}

CustomTooltip.defaultProps = {
    placement: 'bottom',
    text: 'tooltip text'
}