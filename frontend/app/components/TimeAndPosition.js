import React, { Component } from 'react';
import { Col, Row, Form, Button, FormGroup, FormControl, Glyphicon, InputGroup, ControlLabel } from 'react-bootstrap';

import Toggle from 'react-bootstrap-toggle';
import DateTime from 'react-bootstrap-datetimepicker';

import InlineEdit from 'react-edit-inline';
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

/*
class InlineNumberEdit extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inner: 
        }
    }
}*/

class MapSelection extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        var all = this.props.selection;
        var actions = this.props.actions;

        if (Array.isArray(all.elements) &&
            all.elements.length > 0 &&
            Array.isArray(all.elements[0]) &&
            all.elements[0].length > 0)
        {
            return (
                <div>
            {all.elements.map(function(collection, index) {
                return (
                    <Row key = {index}>
                        <Col sm={3}>#{index + 1}</Col>
                        <Col sm={9}>
                            <ul className = 'mapSelectionItems'>
                                { collection.map(function(item, index) {
                                    function saveValue(obj) {
                                        actions.editSelection(index, obj.value);
                                    }

                                    function deleteValue() {
                                        actions.removeFromSelection(index);
                                    }

                                    return (
                                        <li key = {index}>
                                            <Col sm={4}>
                                                <InlineEdit change = {saveValue} text = {String(item)} paramName = 'value' />
                                            </Col>
                                            <Col sm={4}>
                                                <InlineEdit change = {saveValue} text = {String(item)} paramName = 'value' />
                                            </Col>
                                            <Col sm={4}>
                                                <Button bsSize = 'small' bsStyle = 'danger' onClick = {deleteValue}>
                                                    <Glyphicon glyph = 'remove'/>
                                                </Button>
                                            </Col>
                                        </li>
                                    );
                                }) }
                            </ul>
                        </Col>
                    </Row>
                );
            }) }
            </div>);
        } else return (
            <p>Selection is empty</p>
        );
    }
}

export default class TimeAndPositionInput extends Component {
    constructor(props) {
        super(props);

        this.actions = props.genericActions;

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
                            <MapSelection selection = {this.props.selection} actions = {this.props.selectionActions} />
                        </Col>
                    </FormGroup>) }
                </Form>
            </Panel>
        );
    }
}
