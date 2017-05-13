import React, { Component } from 'react';
import { Col, Button, FormGroup, Checkbox } from 'react-bootstrap';
import Toggle from 'react-bootstrap-toggle';

import { getById, isActiveState } from '../constants/REST';

export default class ChannelParameterPicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            channels: false
        }

        this.toggleChannels = this.toggleChannels.bind(this);
    }

    toggleChannels() {
        this.setState(function(){
            return {
                channels: ! this.state.channels
            }
        });
    }

    render() {
        let data = this.state.channels ? this.props.storage.channels.data : this.props.storage.parameters.data;
        let option = this.state.channels ? this.props.options.query.channels : this.props.options.query.parameters;

        return (
            <div>
                <Toggle onClick = {this.toggleChannels} 
                    on = {<span>Channels</span>}
                    off = {<span>Parameters</span>}
                    active = {this.state.channels}
                />
                <div>
                    { Array.isArray(data) && data.map(function(dataElement, index) {
                        let checked = option.indexOf(dataElement.id) != -1;
                        let obj = this;

                        function unmark() {
                            obj.state.channels ? obj.props.generic.clearChannel(dataElement.id) :
                                obj.props.generic.clearParameter(dataElement.id);
                        }

                        function mark() {
                            obj.state.channels ? obj.props.generic.setChannel(dataElement.id) :
                                obj.props.generic.setParameter(dataElement.id);
                        }

                        function makeChoice() {
                            if(checked) unmark();
                            else mark();
                        }

                        return (
                            <FormGroup key = {index}>
                                <Checkbox checked = {checked} onClick = {makeChoice}>{dataElement.name}</Checkbox>
                            </FormGroup>
                        );
                    }.bind(this)) }
                </div>
            </div>
        );
    }
}
