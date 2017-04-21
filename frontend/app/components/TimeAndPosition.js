import React, { Component } from 'react';
import { Col, Row, Form, FormGroup, FormControl, Glyphicon, InputGroup, ControlLabel } from 'react-bootstrap';

import Toggle from 'react-bootstrap-toggle';
import DateTime from 'react-bootstrap-datetimepicker';

import Panel from './Panel';

import '../styles/map.css';

class GeoInputForm extends Component {
    constructor(props) {
        super(props);

        this.actions = props.actions;

        this.latFromChange = this.latFromChange.bind(this);
        this.latToChange = this.latToChange.bind(this);
        this.lngFromChange = this.lngFromChange.bind(this);
        this.lngToChange = this.lngToChange.bind(this);
        this.altFromChange = this.altFromChange.bind(this);
        this.altToChange = this.altToChange.bind(this);
    }

    altFromChange(e) {
        this.actions.altFromInput(parseInt(e.target.value));
    }

    altToChange(e) {
        this.actions.altToInput(parseInt(e.target.value));
    }

    latFromChange(e) {
        this.actions.latFromInput(parseFloat(e.target.value));
    }

    latToChange(e) {
        this.actions.latToInput(parseFloat(e.target.value));
    }

    lngFromChange(e) {
        this.actions.lngFromInput(parseFloat(e.target.value));
    }

    lngToChange(e) {
        this.actions.lngToInput(parseFloat(e.target.value));
    }

    render() {
        var opts = this.props.options;

        return (
            <div>
                <FormGroup controlId = 'Altitude'>
                    <Col componentClass={ControlLabel} sm={2}>
                        Altitude
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>From</InputGroup.Addon>
                            <FormControl onChange = {this.altFromChange} value = {opts.altFrom} type="number" />
                        </InputGroup>
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>To</InputGroup.Addon>
                            <FormControl onChange = {this.altToChange} value = {opts.altTo} type="number" />
                        </InputGroup>
                    </Col>
                </FormGroup>
                <FormGroup controlId = 'Latitude'>
                    <Col componentClass={ControlLabel} sm={2}>
                        Latitude
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>From</InputGroup.Addon>
                            <FormControl onChange = {this.latFromChange} value = {opts.latFrom} type="number" />
                        </InputGroup>
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>To</InputGroup.Addon>
                            <FormControl onChange = {this.latToChange} value = {opts.latTo} type="number" />
                        </InputGroup>
                    </Col>
                </FormGroup>
                <FormGroup controlId = 'Longitude'>
                    <Col componentClass={ControlLabel} sm={2}>
                        Longitude
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>From</InputGroup.Addon>
                            <FormControl onChange = {this.lngFromChange} value = {opts.lngFrom} type="number" />
                        </InputGroup>
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>To</InputGroup.Addon>
                            <FormControl onChange = {this.lngToChange} value = {opts.lngTo} type="number" />
                        </InputGroup>
                    </Col>
                </FormGroup>
            </div>
        );
    }
}

function MapSelection(props) {
    if (props.items.length) {
        return (
            <ul className = 'mapSelectionItems'>
            { props.items.map(function(item) {
                return (
                    <li>{item}</li>
                )
            }) }    
            </ul>
        );
    } else return (
        <p>Selection is empty</p>
    );   
}

export default class TimeAndPositionInput extends Component {
    constructor(props) {
        super(props);

        this.actions = props.actions;

        this.toggleMap = this.toggleMap.bind(this);
        this.dateFromChange = this.dateFromChange.bind(this);
        this.dateToChange = this.dateToChange.bind(this);
    }

    toggleMap() {
        this.actions.mapToggled(! this.props.options.mapEnabled);
    }

    dateFromChange() {
        this.actions.dateFromInput('new date from');
    }

    dateToChange() {
        this.actions.dateToInput('new date to');
    }

    render() {
        var opts = this.props.options;

        return (
            <Panel title = 'Time and position'>
                <Form horizontal>
                    <FormGroup controlId = 'TimeAndDate'>
                        <Col componentClass={ControlLabel} sm={2}>
                            Interval
                        </Col>
                        <Col sm={5}>
                            <DateTime onChange = {this.dateFromChange} />
                        </Col>
                        <Col sm={5}>
                            <DateTime onChange = {this.dateToChange} />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId = 'InputType'>
                        <Col componentClass={ControlLabel} sm={2}>
                            Input
                        </Col>
                        <Col sm={10}>
                            <Toggle onClick = {this.toggleMap} 
                                on = {<span><Glyphicon glyph = 'screenshot' /> Use map</span>}
                                off = {<span><Glyphicon glyph = 'list-alt' /> Manual</span>}
                                active = {opts.mapEnabled} 
                            />
                        </Col>
                    </FormGroup>
                    { ! opts.mapEnabled ? (
                    <GeoInputForm actions = {this.actions} options = {opts} />) : (
                    <FormGroup controlId = 'MapSelection'>
                        <Col componentClass = {ControlLabel} sm = {2}>
                            Selection
                        </Col>
                        <Col sm = {10}>
                            <MapSelection items = {this.props.selection} />
                        </Col>
                    </FormGroup>) }
                </Form>
            </Panel>
        );
    }
}
