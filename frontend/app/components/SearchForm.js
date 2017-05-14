import React, { Component } from 'react';
import { Row, Col, Form, Button, Glyphicon, FormGroup, FormControl, ControlLabel, ProgressBar } from 'react-bootstrap';
import Spinner from 'react-spinjs';
import stringify from 'wellknown';
import moment  from 'moment';

import SessionList from './SessionList';
import ProjectSelector from './ProjectSelector';
import ChannelParameterPicker from './ChannelParameterPicker';

import { isActiveState } from '../constants/REST';
import { Types, selectionToWKT } from '../constants/Selection';

import '../styles/search.css';

class SearchTrigger extends Component {
    constructor(props) {
        super(props);

        this.doSearch = this.doSearch.bind(this);
        this.getSessions = this.getSessions.bind(this);
        this.getMeasurements = this.getMeasurements.bind(this);
    }

    getMeasurements() {
        let channels = this.props.options.useChannels;

        this.props.actions.getMeasurements(
            this.props.storage.sessions.data,
            channels,
            channels ? this.props.options.query.channels : this.props.options.query.parameters
        );
    }

    getSessions() {
        let data = null;
        let time = this.props.options.timelapse;

        /* format selection */
        if(this.props.options.useMap) {
            data = this.props.selection;
        } else {
            /* create single rectangular selection element */
            data = new Object({
                elements: new Array(
                    new Object({
                        type: Types.Rect,
                        data: new Array(
                            this.props.options.rectangle.begin,
                            this.props.options.rectangle.end,
                        )
                    })
                )
            });

            /* flush possible selection */
            this.props.selected.clearSelection();
        }

        this.props.actions.getSessions(
            this.props.options.query.project,
            selectionToWKT(data),
            /* workaround for projects with missing time intervals */
            time.begin > 0 ? time.begin : undefined,
            time.end > 0 ? time.end : undefined
        );
    }

    doSearch() {
        if(! isActiveState(this.props.storage.sessions)) {
            this.getSessions();
        } else {
            if( ! isActiveState(this.props.storage.measurements)) {
                this.getMeasurements();
            }
        }
    }

    render() {
        let label = 'Dummy';

        if(! isActiveState(this.props.storage.sessions)) {
            label = 'Search';
        } else {
            label = 'Continue';
        }

        return (
            <Button onClick = {this.doSearch}>
                <Glyphicon glyph = 'search' /> {label}
            </Button>
        )
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
        if( isActiveState(this.props.storage.sessions) || isActiveState(this.props.storage.measurements) ) {
            return (
                <Button onClick = {this.resetData}>
                    <Glyphicon glyph = 'trash' /> Reset search
                </Button>
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
                <Form horizontal>
                    <FormGroup controlId = 'Projects'>
                        <Col componentClass = {ControlLabel} sm = {2}>
                            Project
                        </Col>
                        <Col sm = {10}>
                            <ProjectSelector
                                mapped  = {this.props.mapped}
                                generic = {this.props.generic}
                                storage = {this.props.storage}
                                options = {this.props.options}
                                actions = {this.props.actions}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId = 'DataSource'>
                        <Col componentClass = {ControlLabel} sm = {2}>
                            Query by
                        </Col>
                        <Col sm = {10}>
                            <ChannelParameterPicker
                                generic = {this.props.generic}
                                actions = {this.props.actions}
                                storage = {this.props.storage}
                                options = {this.props.options}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId = 'Sessions'>
                        <Col componentClass = {ControlLabel} sm = {2}>
                            Sessions
                        </Col>
                        <Col sm = {10}>
                            <SessionList
                                mapped  = {this.props.mapped}
                                actions = {this.props.actions}
                                storage = {this.props.storage}
                                generic = {this.props.generic}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col sm = {6}>
                            <SearchTrigger
                                storage = {this.props.storage}
                                options = {this.props.options}
                                actions = {this.props.actions}
                                selected = {this.props.selected}
                                selection = {this.props.selection}
                            />
                        </Col>
                        <Col sm = {6}>
                            <ResetTrigger
                                storage = {this.props.storage}
                                actions = {this.props.actions}
                            />
                        </Col>
                    </FormGroup>
                </Form>
            </div>
        )
    }
}
