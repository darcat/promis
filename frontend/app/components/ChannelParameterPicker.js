import React, { Component } from 'react';
import { Col, Button, FormGroup, Checkbox } from 'react-bootstrap';
import Toggle from 'react-bootstrap-toggle';

import { getById, isActiveState } from '../constants/REST';

export default class ChannelParameterPicker extends Component {
    constructor(props) {
        super(props);

        this.fetchData = this.fetchData.bind(this);
        this.toggleChannels = this.toggleChannels.bind(this);
    }

    fetchData(project) {
        this.props.actions.getChannels(project);
        this.props.actions.getParameters(project);
    }

    toggleChannels() {
        this.props.search.toggleChannels(! this.props.options.useChannels);
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.options.query.project != nextProps.options.query.project) {
            this.fetchData(nextProps.options.query.project);
        }
    }

    render() {
        let data = this.props.options.useChannels ? this.props.storage.channels.data : this.props.storage.parameters.data;
        let option = this.props.options.useChannels ? this.props.options.query.channels : this.props.options.query.parameters;

        return (
            <div>
                <Toggle
                    on = {<span>Level 1</span>}
                    off = {<span>Level 2</span>}
                    active = {this.props.options.useChannels}
                    onClick = {this.toggleChannels}
                    disabled = {! this.props.active}
                />
                <div>
                    { Array.isArray(data) && data.map(function(dataElement, index) {
                        let checked = option.indexOf(dataElement.id) != -1;
                        let obj = this;

                        function unmark() {
                            obj.props.options.useChannels ? obj.props.search.clearChannel(dataElement.id) :
                                obj.props.search.clearParameter(dataElement.id);
                        }

                        function mark() {
                            obj.props.options.useChannels ? obj.props.search.setChannel(dataElement.id) :
                                obj.props.search.setParameter(dataElement.id);
                        }

                        function makeChoice() {
                            if(checked) unmark();
                            else mark();
                        }

                        return (
                            <div key = {index}>
                                <Checkbox
                                    disabled = {! this.props.active}
                                    checked = {checked}
                                    onClick = {makeChoice}>
                                    {dataElement.name}
                                </Checkbox>
                            </div>
                        );
                    }.bind(this)) }
                </div>
            </div>
        );
    }
}

ChannelParameterPicker.defaultProps = {
    active: true
};
