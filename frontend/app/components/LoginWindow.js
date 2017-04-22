import React, { Component } from 'react';
import { Col, Form, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import ModalWindow from './Modal';

export default class LoginWindow extends Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        console.log('login submit');
    }

    render() {
        return (
            <ModalWindow show = {this.props.show} onClose = {this.props.onClose} title = 'Login'>
                <Form onSubmit = {this.handleSubmit}>
                    <FormGroup controlId = 'username-group'>
                        <ControlLabel>Username</ControlLabel>
                        <FormControl type = 'text' placeholder = 'Enter your login' />
                    </FormGroup>
                    <FormGroup controlId = 'password-group'>
                        <ControlLabel>Password</ControlLabel>
                        <FormControl type = 'password' placeholder = 'Enter your password' />
                    </FormGroup>
                    <Button bsStyle = 'success' type = 'submit'>Sign in</Button>
                </Form>
            </ModalWindow>
        )
    }
}
