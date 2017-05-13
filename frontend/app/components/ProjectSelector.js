import React, { Component } from 'react';
import { Col, Button, FormGroup, FormControl, ControlLabel, ProgressBar } from 'react-bootstrap';

import { getById, isActiveState } from '../constants/REST';

export default class ProjectSelector extends Component {
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
            this.props.generic.dateFromInput(project.timelapse.start);
            this.props.generic.dateToInput(project.timelapse.end);

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
