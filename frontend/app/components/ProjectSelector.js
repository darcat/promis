import React, { Component } from 'react';
import { Col, Button, FormGroup, FormControl, ControlLabel, ProgressBar } from 'react-bootstrap';

import { getById, isActiveState } from '../constants/REST';

export default class ProjectSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: null
        }

        this.handleChange = this.handleChange.bind(this);
        this.updateProject = this.updateProject.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(isActiveState(nextProps.storage.projects) && (this.state.selected === null)) {
            this.updateProject();
        }
    }

    handleChange(event) {
        event.persist();

        this.updateProject(parseInt(event.target.value));
    }

    updateProject(selected) {
        let initial = (selected === undefined && this.state.selected === null);
        let project = getById(this.props.storage.projects.data, selected, initial);

        if(project) {
            selected = project.id;

            this.setState(function(){
                return {
                    selected: selected
                }
            }, function() {
                /* update selected project */
                this.props.search.setProject(selected);

                /* update datetime fields according to project (up to seconds) */
                this.props.search.dateFromInput(project.timelapse.start);
                this.props.search.dateToInput(project.timelapse.end);

                /* reset data */
                this.props.actions.resetData();
                this.props.search.clearQuery();
                this.props.mapped.clearGeolines();
            });
        }
    }

    render() {
        let proj = getById(this.props.storage.projects.data, this.state.selected, true);
        let desc = proj ? proj.description : 'No description available';

        return (
            <div>
                <FormControl onChange = {this.handleChange} componentClass="select" placeholder="select">
                    { this.props.storage.projects.data && this.props.storage.projects.data.map(function(project, key) {
                        return (
                            <option key = {key} value = {project.id}>{project.name}</option>
                        )
                    }.bind(this))}
                </FormControl>
                <div>
                    <p><br />
                        { desc }
                    </p>
                </div>
            </div>
        );
    }
}
