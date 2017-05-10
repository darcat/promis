import React, { Component } from 'react';
import { Row, Col, Button, Glyphicon, FormGroup, FormControl, ControlLabel, ProgressBar } from 'react-bootstrap';
import Spinner from 'react-spinjs';
import stringify from 'wellknown';
import moment  from 'moment';

import { getById, isActiveState } from '../constants/REST';

class ProjectSelector extends Component {
    constructor(props) {
        super(props);

        this.updateProject = this.updateProject.bind(this);
    }

    componentDidMount() {
        this.updateProject();
    }

    updateProject(event) {
        let selected = null;

        if(event) {
            event.persist();
            selected = parseInt(event.target.value);
        }

        let project = getById(this.props.storage.projects.data, selected, selected === null);

        //console.log(project);
        if(project) {
            /* update selected project */
            this.props.generic.setCurrentProject(selected);

            /* update datetime fields according to project (up to seconds) */
            this.props.generic.dateFromInput(project.timelapse.start * 1000);
            this.props.generic.dateToInput(project.timelapse.end * 1000);

            /* reset data */
            this.props.actions.resetData();
            this.props.mapped.clearGeolines();
        }
    }

    render() {
        let proj = getById(this.props.storage.projects.data, this.props.options.project, true);
        let desc = proj ? proj.description : 'No description available';

        return (
            <FormGroup controlId="projSelect">
                <ControlLabel>Select project</ControlLabel>
                <FormControl onChange = {this.updateProject} componentClass="select" placeholder="select">
                    { this.props.storage.projects.data && this.props.storage.projects.data.map(function(project, key) {
                        return (
                            <option key = {key} value = {project.id}>{project.name}</option>
                        )
                    }.bind(this))}
                </FormControl>
                <div>
                    <p>
                        { desc }
                    </p>
                </div>
            </FormGroup>
        );
    }
}

class ChannelParameterList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div>chan params</div>);
    }
}

class SessionList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            progress  : -1
        }

        this.eraseGeolines = this.eraseGeolines.bind(this);
        this.displayGeolines = this.displayGeolines.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if( ! isActiveState(nextProps.storage.sessions)) {
            this.setState(function() {
                return {
                    progress: -1
                }
            })
        }
    }

    eraseGeolines() {
        this.setState(function(){
            return {
                progress : -1
            }
        });

        this.props.mapped.clearGeolines();
    }

    displayGeolines() {
        /* slow, proper version needs map rework */
        let now = 0;
        let total = this.props.storage.sessions.data.length;
        let geolines = new Array();

        this.props.storage.sessions.data.forEach(function(session, index) {
            this.props.actions.getSingle(session.url, null, function(data) {
                this.setState(function() {
                    return {
                        progress : ++now
                    }
                }, function() {
                    geolines.push(data.geo_line)
                });
            }.bind(this));
        }.bind(this));

        this.props.mapped.pushGeolines(geolines);

        /* open the map if not opened already */
        this.props.generic.mapToggled(true);
    }

    render() {
        if( isActiveState(this.props.storage.sessions)) {
            let sessions = this.props.storage.sessions.data;
            let Control = null;

            if(this.state.progress == sessions.length) {
                Control = <Button onClick = {this.eraseGeolines}>Clear map</Button>;
            } else {
                if(this.state.progress != -1) {
                    Control = <ProgressBar active now = {this.state.progress} max = {sessions.length} />;
                } else {
                    Control = <Button onClick = {this.displayGeolines}>Display on map</Button>;
                }
            }

            return (
                <FormGroup controlId = 'SessionGroup'>
                    <Col componentClass = {ControlLabel} sm={2}>
                        Sessions
                    </Col>
                    <Col sm={5}>
                        <p>{sessions.length} sessions found</p>
                    </Col>
                    <Col sm={5}>
                        { Control }
                    </Col>
                </FormGroup>
            );
        } else {
            //this.eraseGeolines();

            return(<div></div>);
        }
    }
}

class SessionsTrigger extends Component {
    constructor(props) {
        super(props);

        this.getSessions = this.getSessions.bind(this);
    }

    getSessions() {
        this.props.actions.getSessions(this.props.options.project);
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
        //this.props.actions.getMeasurements(this.props.options.project);
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
    }


    doSearch() {

        /*this.props.actions.makeQuery('/en/api/sessions', {params}, function(sessions) {
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
            

            
        }.bind(this));*/
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
                <ChannelParameterList
                    generic = {this.props.generic}
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