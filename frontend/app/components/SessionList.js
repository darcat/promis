import React, { Component } from 'react';
import { Col, Button, FormGroup, ProgressBar, ControlLabel } from 'react-bootstrap';

import { getById, isActiveState } from '../constants/REST';

export default class SessionList extends Component {
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
        //this.props.mapped.toggleRound(true);
        //this.props.mapped.toggleRound(false);

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
