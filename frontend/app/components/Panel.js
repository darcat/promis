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
        var drag = !this.props.disableDrag;

        return (
            <div>
                { drag ? (
                    <Draggable key = {1} handle = '.panel-title'>
                        <Col md={6} sm={12}>
                            <Accordion>
                                <Panel className = {this.props.className} header = {this.props.title}>{this.props.children}</Panel>
                            </Accordion>
                        </Col>
                    </Draggable> ) : (
                        <Col md={6} sm={12}>
                            <Accordion>
                                <Panel className = {this.props.className} header = {this.props.title}>{this.props.children}</Panel>
                            </Accordion>
                        </Col>
                    )
                }
            </div>
        )
    }
}

AdvancedPanel.defaultProps = {
    title: 'Panel title',
    disableDrag: false
}
