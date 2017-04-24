import React, { Component } from 'react';
import { Button, Glyphicon, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Spinner from 'react-spinjs';
import stringify from 'wellknown';

export default class SearchForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            desc: '',
            project: 0,
            projects: [],
            sessions: []
        }

        this.doSearch = this.doSearch.bind(this);
        this.updateProject = this.updateProject.bind(this);
        this.queryProjects = this.queryProjects.bind(this);
        this.querySessions = this.querySessions.bind(this);
    }

    componentDidMount() {
        this.queryProjects();
    }

    updateProject(data) {
        var id = parseInt(data.target ? data.target.value : data);

        function backproj (proj, id) {
            var z = false;
            proj.map(function(p) {
                if(parseInt(p.id) == parseInt(id)) {
                    z = p.description;
                }
            });

            return z;
        }

        var desc = backproj(this.state.projects, id);

        this.setState(function() {
            return {
                desc: desc ? desc : '',
                project: id ? id : this.state.projects[0]
            }
        }.bind(this))
    }

    queryProjects() {
        this.props.actions.makeQuery('/en/api/projects', {}, function(projects) {
            this.setState(function() {
                return {
                    project: projects.results[0].id,
                    projects : projects.results
                }
            })
        }.bind(this));
    }

    querySessions(project, from, to, selection) {
        var params = {};

        params.space_project = project;
        params.time_begin = from;
        params.time_end = to;

        if(Array.isArray(selection.elements)) {
            console.log('sele');
            var geo = {
                'type': 'Feature',
                'geometry' : {
                    'type': 'MultiPolygon',
                    'coordinates': selection.elements
                }
            }

            console.log(JSON.stringify(geo));
            params.polygon = stringify(geo);

            console.log(params.polygon);
        }
        
        //params.polygon = ''//Array.isArray(geodata) ? wkt.fromObject(geodata.map(function(item) { return { x: item[0], y: item[1] } })) : undefined;

        this.props.actions.makeQuery('/en/api/sessions', {params}, function(sessions) {
            this.setState(function() {
                return {
                    sessions: sessions
                }
            })
        });
    }

    doSearch() {
        this.querySessions(this.state.project, '', '', this.props.selection)
    }

    render() {

        var proj = this.state.project;
        var projects = this.state.projects;
        var desc = this.state.desc; //projects.length ? backproj(projects, proj) : '';// && projects[proj]) ? projects[proj].description : '';

        //console.log(active);
        return (
            <div>
                <FormGroup controlId="projSelect">
                    <ControlLabel>Select project</ControlLabel>
                    <FormControl onChange = {this.updateProject} componentClass="select" placeholder="select">
                        { projects && projects.map(function(project, key) {
                            return (
                                <option key = {key} value = {project.id}>{project.name}</option>
                            )
                        }.bind(this))}
                    </FormControl>
                    <div>{ desc }</div>
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