import React, { Component } from 'react';
import { Button, Glyphicon, FormGroup } from 'react-bootstrap';
import Spinner from 'react-spinjs';
import stringify from 'wellknown';

export default class SearchForm extends Component {
    constructor(props) {
        super(props);

        this.queryProjects = this.queryProjects.bind(this);
        this.querySessions = this.querySessions.bind(this);
    }

    queryProjects() {
        this.props.actions.makeQuery('/en/api/projects', {}, 'projects');


    }

    querySessions(project, from, to, selection) {
        var params = {};

        params.space_project = project;
        params.time_begin = from;
        params.time_end = to;


        if(Array.isArray(selection)) {
            var geo = {
                'type': 'Feature',
                'geometry' : {
                    'type': 'MultiPolygon',
                    'coordinates': selection.elements
                }
            }

            params.polygon = stringify(geo);
        }
        
        //params.polygon = ''//Array.isArray(geodata) ? wkt.fromObject(geodata.map(function(item) { return { x: item[0], y: item[1] } })) : undefined;

        this.props.actions.makeQuery('/en/api/sessions', params, 'sessions');
    }

    render() {
        return (
            <div>
                <FormGroup>
                    <Button onClick = {this.queryProjects}>
                        <Glyphicon glyph = 'search' /> Search
                    </Button>
                </FormGroup>
            </div>
        )
    }
}