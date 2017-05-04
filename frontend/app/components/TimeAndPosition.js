import React, { Component } from 'react';
import { Col, Row, Form, Button, FormGroup, FormControl, Glyphicon, InputGroup, ControlLabel } from 'react-bootstrap';

import Toggle from 'react-bootstrap-toggle';
import DateTime from 'react-bootstrap-datetimepicker';

import InlineEdit from 'react-edit-inline';
import Panel from './Panel';

import '../styles/map.css';

import { isSelectionElement } from '../constants/Selection';

class GeoInputForm extends Component {
    constructor(props) {
        super(props);

        this.actions = props.actions;

        this.latFromChange = this.latFromChange.bind(this);
        this.latToChange = this.latToChange.bind(this);
        this.lngFromChange = this.lngFromChange.bind(this);
        this.lngToChange = this.lngToChange.bind(this);
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
                <FormGroup controlId = 'Latitude'>
                    <Col componentClass={ControlLabel} sm={2}>
                        Latitude
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>From</InputGroup.Addon>
                            <FormControl onChange = {this.latFromChange} value = {opts.latFrom} type="number" />
                            <InputGroup.Addon>&deg;</InputGroup.Addon>
                        </InputGroup>
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>To</InputGroup.Addon>
                            <FormControl onChange = {this.latToChange} value = {opts.latTo} type="number" />
                            <InputGroup.Addon>&deg;</InputGroup.Addon>
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
                            <InputGroup.Addon>&deg;</InputGroup.Addon>
                        </InputGroup>
                    </Col>
                    <Col sm={5}>
                        <InputGroup>
                            <InputGroup.Addon>To</InputGroup.Addon>
                            <FormControl onChange = {this.lngToChange} value = {opts.lngTo} type="number" />
                            <InputGroup.Addon>&deg;</InputGroup.Addon>
                        </InputGroup>
                    </Col>
                </FormGroup>
            </div>
        );
    }
}

class MapSelection extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let selection = this.props.selection;
        let actions = this.props.actions;

        if(isSelectionElement(selection.elements[0]) && selection.elements[0].data.length > 0)
        {
            return (
                <FormGroup controlId = 'selectionControlSelect'>
                    <ControlLabel>Selection</ControlLabel>
                        <FormControl componentClass = 'select' placeholder = 'select'>
                            <option value="select">select</option>
                            <option value="other">...</option>
                        </FormControl>
                    </FormGroup>
                    /*
            { selection.elements.map(function(collection, rootIndex) {
                return (

                    <Row key = {rootIndex}>
                        <Col sm={3}>#{rootIndex + 1}</Col>
                        <Col sm={9}>
                            <ul className = 'mapSelectionItems'>
                                { collection.map(function(item, itemIndex) {
                                    function saveValue(lat, lng) {
                                        actions.editSelection(itemIndex, [parseFloat(lat), parseFloat(lng)], rootIndex);
                                    }

                                    function deleteValue() {
                                        actions.removeFromSelection(itemIndex, rootIndex);
                                    }

                                    if(Array.isArray(item)) {
                                        var lat = String(item[0]);
                                        var lng = String(item[1]);

                                        function saveLat(obj) {
                                            saveValue(obj.value, lng);
                                        }

                                        function saveLng(obj) {
                                            saveValue(lat, obj.value);
                                        }

                                        return (
                                        <li key = {itemIndex}>
                                            <Col sm={4}>
                                                <InlineEdit change = {saveLat} text = {lat} paramName = 'value' />
                                            </Col>
                                            <Col sm={4}>
                                                <InlineEdit change = {saveLng} text = {lng} paramName = 'value' />
                                            </Col>
                                            <Col sm={4}>
                                                <Button bsSize = 'small' bsStyle = 'danger' onClick = {deleteValue}>
                                                    <Glyphicon glyph = 'remove'/>
                                                </Button>
                                            </Col>
                                        </li>
                                    ) }
                                }) }
                            </ul>
                        </Col>
                    </Row>
                );
            }) }
        </div>*/);
        } else return (
            <p>Selection is empty</p>
        );
    }
}

function NextPoint(props) {
    let lat = props.data ? props.data[0] : 0;
    let lng = props.data ? props.data[1] : 0;

    return (
        <div>Next point: {lat}, {lng}</div>
    )
}

export default class TimeAndPositionInput extends Component {
    constructor(props) {
        super(props);

        this.actions = props.genericActions;

        this.toggleMap = this.toggleMap.bind(this);
        this.dateFromChange = this.dateFromChange.bind(this);
        this.dateToChange = this.dateToChange.bind(this);
        this.altFromChange = this.altFromChange.bind(this);
        this.altToChange = this.altToChange.bind(this);
    }

    toggleMap() {
        this.actions.mapToggled(! this.props.options.mapEnabled);
    }

    dateFromChange(newFrom) {
        this.actions.dateFromInput(newFrom);
    }

    dateToChange(newTo) {
        this.actions.dateToInput(newTo);
    }

    altFromChange(e) {
        this.actions.altFromInput(parseInt(e.target.value));
    }

    altToChange(e) {
        this.actions.altToInput(parseInt(e.target.value));
    }

    render() {
        let opts = this.props.options;

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
                    <FormGroup controlId = 'Altitude'>
                        <Col componentClass={ControlLabel} sm={2}>
                            Altitude
                        </Col>
                        <Col sm={5}>
                            <InputGroup>
                                <InputGroup.Addon>From</InputGroup.Addon>
                                <FormControl onChange = {this.altFromChange} value = {opts.altFrom} type="number" />
                                <InputGroup.Addon>m</InputGroup.Addon>
                            </InputGroup>
                        </Col>
                        <Col sm={5}>
                            <InputGroup>
                                <InputGroup.Addon>To</InputGroup.Addon>
                                <FormControl onChange = {this.altToChange} value = {opts.altTo} type="number" />
                                <InputGroup.Addon>m</InputGroup.Addon>
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup controlId = 'InputType'>
                        <Col componentClass={ControlLabel} sm={2}>
                            Geo input
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
                            { this.props.selection.active &&
                            <NextPoint data = {this.props.preview} /> }
                            <MapSelection selection = {this.props.selection} actions = {this.props.selectionActions} />
                        </Col>
                    </FormGroup>) }
                </Form>
            </Panel>
        );
    }
}
