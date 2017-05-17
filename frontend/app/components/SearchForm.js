import React, { Component } from 'react';
import { Row, Col, Form, Button, Glyphicon, FormGroup, FormControl, ControlLabel, ProgressBar } from 'react-bootstrap';
import Spinner from 'react-spinjs';
import stringify from 'wellknown';
import moment  from 'moment';

import SessionList from './SessionList';
import ProjectSelector from './ProjectSelector';
import ChannelParameterPicker from './ChannelParameterPicker';

import { isActiveState } from '../constants/REST';
import { Types, selectionToWKT, latlngRectangle } from '../constants/Selection';

import '../styles/search.css';

class SearchTrigger extends Component {
    constructor(props) {
        super(props);

        this.doSearch = this.doSearch.bind(this);
        this.getSessions = this.getSessions.bind(this);
        this.getMeasurements = this.getMeasurements.bind(this);
    }

    getMeasurements() {
        this.props.actions.getMeasurements(
            this.props.storage.sessions.data,
            this.props.options.useChannels,
            /* until backend is fixed, filter by params only */
            this.props.options.query.parameters
        );
    }

    getSessions() {
        let selection = null;
        let time = this.props.options.timelapse;

        /* add selection if any */
        selection = this.props.selection.elements.length > 0 ?
            this.props.selection.elements.slice() : [];

        /* TODO: discuss if we need a union of the selections or an intersection */

        /* add a rectangle based on lat/lon input if the selection is not the whole globe */
        let latlng = latlngRectangle(this.props.options.rectangle);
        if(latlng){
            selection.push(latlng);
        }

        /* create the WKT representation or replace with null */
        let geo_polygon = selection.length > 0 ? selectionToWKT(selection) : null;

        this.props.actions.getSessions(
            this.props.options.query.project,
            geo_polygon,
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
                                search  = {this.props.search}
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
                                search = {this.props.search}
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
                                search = {this.props.search}
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
