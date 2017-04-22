import React, { Component } from 'react';
import { Col, Accordion, Panel } from 'react-bootstrap';
import Draggable from 'react-draggable';

import '../styles/panel.css';

// TODO: separate click collapse handler and drag toggling
// { !this.props.disableDrag ? (<Draggable handle = '.panel-title'>) : ()}

export default class AdvancedPanel extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Col md={6} sm={12}>
                <Panel className = {this.props.className} header = {this.props.title}>{this.props.children}</Panel>
            </Col>
        )
    }
}

AdvancedPanel.defaultProps = {
    title: 'Panel title'
}
