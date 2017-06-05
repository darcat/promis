import React, { Component } from 'react';
import { Row, Col, Form, Button, Glyphicon, FormGroup, FormControl, ControlLabel, ProgressBar } from 'react-bootstrap';
import Spinner from 'react-spinjs';
import stringify from 'wellknown';
import moment  from 'moment';

import ProjectSelector from './ProjectSelector';
import ChannelParameterPicker from './ChannelParameterPicker';

import { isActiveState } from '../constants/REST';
import { Types, selectionToWKT, latlngRectangle } from '../constants/Selection';

import '../styles/search.css';

export default class SearchForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            enabled: true
        };

        this.resetSearch = this.resetSearch.bind(this);
        this.getData = this.getData.bind(this);
    }

    componentDidMount() {
        this.props.actions.getProjects();
    }

    /* TODO: rename to getMeasurements */
    getData() {
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

        //console.log(selection);

        /* create the WKT representation or replace with null */
        let geo_polygon = selection.length > 0 ? selectionToWKT(selection) : null;

        this.props.actions.getData(
            this.props.options.query.project,
            geo_polygon,
            /* workaround for projects with missing time intervals */
            time.begin > 0 ? time.begin : undefined,
            time.end > 0 ? time.end : undefined,
            this.props.options.query.channels,
            this.props.options.query.parameters
        );
    }

    resetSearch() {
        this.props.search.clearQuery();
        this.props.actions.resetData();
        this.props.mapped.clearGeolines();
    }

    render() {
        let active = true;
        let Control = null;

        /* TODO: hunt where this setting is coming from */
        //let sessions = isActiveState(this.props.storage.sessions);
        let measurements = isActiveState(this.props.storage.measurements);

        if(! measurements) {
            Control = (
                <Button onClick = {this.getData}>
                    <Glyphicon glyph = 'search' />Search
                </Button>
            );
        } else {
            active = false;
            Control = (
                <Button onClick = {this.resetSearch}>
                    <Glyphicon glyph = 'trash' /> Reset search
                </Button>
            );
        }
        /* TODO: "Measurements" word is too long and 3/9 ratio for the columns seems too sparse */
        return (
            <div>
                <Form horizontal>
                    <FormGroup controlId = 'Projects'>
                        <Col componentClass = {ControlLabel} sm = {3}>
                            Project
                        </Col>
                        <Col sm = {9}>
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
                        <Col componentClass = {ControlLabel} sm = {3}>
                            Measurements
                        </Col>
                        <Col sm = {9}>
                            <ChannelParameterPicker
                                active = {active}
                                search = {this.props.search}
                                actions = {this.props.actions}
                                storage = {this.props.storage}
                                options = {this.props.options}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col sm = {12}>
                            { Control }
                        </Col>
                    </FormGroup>
                </Form>
            </div>
        )
    }
}
