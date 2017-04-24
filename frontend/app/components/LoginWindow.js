import React, { Component } from 'react';
import Spinner from 'react-spinjs';
import { Col, Form, Alert, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import ModalWindow from './Modal';

export default class LoginWindow extends Component {
    constructor(props) {
        super(props);

        this.login = null;
        this.pass = null;

        this.passChange = this.passChange.bind(this);
        this.loginChange = this.loginChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    passChange(e) {
        this.pass = e.target.value;
    }

    loginChange(e) {
        this.login = e.target.value;
    }

    handleSubmit(event) {
        event.preventDefault();

        this.props.onLogin(this.login, this.pass)
        console.log('login submit');
    }

    render() {
        var data = this.props.userData;
        var fail = (!data.success && data.detail.length > 0);// && data.detail.len;

        return (
            <ModalWindow show = {this.props.show} onClose = {this.props.onClose} title = 'Login'>
                { data.loading ? (
                    <Spinner />
                ) : (
                    <Form onSubmit = {this.handleSubmit}>
                        <FormGroup controlId = 'username-group'>
                            <ControlLabel>Username</ControlLabel>
                            <FormControl onChange = {this.loginChange} type = 'text' placeholder = 'Enter your login' />
                        </FormGroup>
                        <FormGroup controlId = 'password-group'>
                            <ControlLabel>Password</ControlLabel>
                            <FormControl onChange = {this.passChange} type = 'password' placeholder = 'Enter your password' />
                        </FormGroup>
                        <Button bsStyle = 'success' type = 'submit'>Sign in</Button>
                    </Form>
                ) }
                { fail ? ([
                <br key = {1} />,
                <Alert key = {2} bsStyle = 'danger'>
                    <strong>Error</strong> {data.detail}
                </Alert> ]) : ([]) }
            </ModalWindow>
        )
    }
}
