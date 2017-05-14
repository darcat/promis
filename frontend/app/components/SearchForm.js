import React, { Component } from 'react';
import { Row, Col, Button, Glyphicon, FormGroup, FormControl, ControlLabel, ProgressBar } from 'react-bootstrap';
import Spinner from 'react-spinjs';
import stringify from 'wellknown';
import moment  from 'moment';

import SessionList from './SessionList';
import ProjectSelector from './ProjectSelector';
import ChannelParameterPicker from './ChannelParameterPicker';

import { isActiveState } from '../constants/REST';
import { Types, selectionToWKT } from '../constants/Selection';

class SessionsTrigger extends Component {
    constructor(props) {
        super(props);

        this.getSessions = this.getSessions.bind(this);
    }

    getSessions() {
        let data = null;
        let time = this.props.options.timelapse;

        /* format selection */
        if(this.props.options.useMap) {
            data = this.props.selection;
        } else {
            /* create single selection element */
            data = new Object({
                elements: new Array(
                    new Object({
                        type: Types.Polygon,
                        data: new Array(this.props.options.polygon.begin, this.props.options.polygon.end)
                    })
                )
            });
        }

        this.props.actions.getSessions(
            this.props.options.query.project,
            selectionToWKT(data),
            /* workaround for projects with missing time intervals */
            time.begin > 0 ? time.begin : undefined,
            time.end > 0 ? time.end : undefined
        );
    }

    render() {
        if(! isActiveState(this.props.storage.sessions)) {
            return (
                <FormGroup>
                    <Button onClick = {this.getSessions}>
                        <Glyphicon glyph = 'search' /> Get sessions
                    </Button>
                </FormGroup>
            )
        } else {
            return (<div></div>);
        }
    }
}

class MeasurementsTrigger extends Component {
    constructor(props) {
        super(props);

        this.getMeasurements = this.getMeasurements.bind(this);
    }

    getMeasurements() {
        this.props.actions.getMeasurements(this.props.storage.sessions.data, new Array(1, 2));//this.props.options.project);
    }

    render() {
        if(! isActiveState(this.props.storage.measurements) && isActiveState(this.props.storage.sessions)) {
            return (
                <FormGroup>
                    <Button onClick = {this.getMeasurements}>
                        <Glyphicon glyph = 'search' /> Get measurements
                    </Button>
                </FormGroup>
            )
        } else {
            return (<div></div>);
        }
    }
}

class ResetTrigger extends Component {
    constructor(props) {
        super(props);

        this.resetData = this.resetData.bind(this);
    }

    resetData() {
        this.props.actions.resetData();
    }

    render() {
        if( isActiveState(this.props.storage.sessions) || isActiveState(this.props.storage.channels) ||
            isActiveState(this.props.storage.parameters) || isActiveState(this.props.storage.measurements) ) {
            return (
                <FormGroup>
                    <Button onClick = {this.resetData}>
                        <Glyphicon glyph = 'trash' /> Reset search
                    </Button>
                </FormGroup>
            )
        } else {
            return (<div></div>);
        }
    }
}

export default class SearchForm extends Component {
    constructor(props) {
        super(props);

        this.props.actions.getProjects();
        this.props.actions.getChannels();
        this.props.actions.getParameters();
    }

    render() {
        return (
            <div>
                <ProjectSelector
                    mapped  = {this.props.mapped}
                    generic = {this.props.generic}
                    storage = {this.props.storage}
                    options = {this.props.options}
                    actions = {this.props.actions}
                />
                <SessionList
                    mapped  = {this.props.mapped}
                    actions = {this.props.actions}
                    storage = {this.props.storage}
                    generic = {this.props.generic}
                />
                <SessionsTrigger
                    storage = {this.props.storage}
                    options = {this.props.options}
                    actions = {this.props.actions}
                    selection = {this.props.selection}
                />
                <ChannelParameterPicker
                    generic = {this.props.generic}
                    actions = {this.props.actions}
                    storage = {this.props.storage}
                    options = {this.props.options}
                />
                <MeasurementsTrigger
                    storage = {this.props.storage}
                    actions = {this.props.actions}
                />
                <ResetTrigger
                    storage = {this.props.storage}
                    actions = {this.props.actions}
                />
            </div>
        )
    }
}
