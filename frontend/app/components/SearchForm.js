import React, { Component } from 'react';
import { Button, Glyphicon, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Spinner from 'react-spinjs';
import stringify from 'wellknown';
import moment  from 'moment';

import { getById } from '../constants/REST';

export default class SearchForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            desc: null,
            project: 0,
        }

        this.doSearch = this.doSearch.bind(this);
        this.updateProject = this.updateProject.bind(this);
        //this.querySessions = this.querySessions.bind(this);
    }

    componentDidMount() {
        this.props.actions.getProjects();
    }

    updateProject(event) {
        event.persist();

        let selected = parseInt(event.target.value);
        let project = getById(this.props.storage.projects.data, selected);

        if(project) {
            this.setState(function() {
                return {
                    desc: project.description,
                    project: selected
                }
            });

            /* update datetime fields according to project (up to seconds) */
            this.props.generic.dateFromInput(project.timelapse.start * 1000);
            this.props.generic.dateToInput(project.timelapse.end * 1000);
        }
    }

    doSearch(){//(project, from, to, selection) {
        var params = {};

        params.space_project = this.state.project;
        params.time_begin = '';//from;
        params.time_end = '';//to;

        if(Array.isArray(this.props.selection.elements)) {
            var geo = {
                'type': 'Feature',
                'geometry' : {
                    'type': 'MultiPolygon',
                    'coordinates': this.props.selection.elements
                }
            }

            //console.log(JSON.stringify(geo));
            //params.polygon = stringify(geo);

            //console.log(params.polygon);
        }
        
        //params.polygon = ''//Array.isArray(geodata) ? wkt.fromObject(geodata.map(function(item) { return { x: item[0], y: item[1] } })) : undefined;

        this.props.actions.makeQuery('/en/api/sessions', {params}, function(sessions) {
            var res = new Array();

            function idfromurl(url) {
                let r = /.*\/([0-9]+)/g;
                let m = r.exec(url);
                return m[1];
            }

            sessions.results.map(function(session) {
                if(Array.isArray(session.measurements)) {
                    session.measurements.map(function(url) {
                        //this.props.actions.makeQuery()
                        let mid = idfromurl(url);
                        let dm = moment(session.time_begin);

                        this.props.actions.setField([
                            {
                                name: 'Measurement #' + mid,
                                date: String(dm.day() + '.' + dm.month() + '.' + dm.year()),
                                mid: mid
                            }]);
                        //console.log(mid);
                    }.bind(this));
                }
                //this.props.actions.
            }.bind(this));

            //this.props.actions.setField([{sessions: 'date', mid: 1, name: 'sdfsdf'}]);

            //console.log(sessions);
            

            
        }.bind(this));
    }

    //doSearch() {
    //    this.querySessions(this.state.project, '', '', this.props.selection)
    //}

    render() {
        //console.log(this.props.data.projects)

        return (
            <div>
                <FormGroup controlId="projSelect">
                    <ControlLabel>Select project</ControlLabel>
                    <FormControl onChange = {this.updateProject} componentClass="select" placeholder="select">
                        { this.props.storage.projects.data && this.props.storage.projects.data.map(function(project, key) {
                            return (
                                <option key = {key} value = {project.id}>{project.name}</option>
                            )
                        }.bind(this))}
                    </FormControl>
                    <div>{ this.state.desc }</div>
                </FormGroup>
                <FormGroup>
                    <Button onClick = {this.doSearch}>
                        <Glyphicon glyph = 'search' /> Search
                    </Button>
                </FormGroup>
            </div>
        )
    }
}