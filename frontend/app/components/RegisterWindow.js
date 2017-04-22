import React, { Component } from 'react';
import { Col, Form, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import ModalWindow from './Modal';

export default class RegisterWindow extends Component {
    constructor(props) {
        super(props);
    }

    handleSubmit(event) {
        event.preventDefault();

        console.log('password submit');
    }

    render() {
        return (
            <ModalWindow show = {this.props.show} onClose = {this.props.onClose} title = 'Register'>
                <Form horizontal onSubmit = {this.handleSubmit}>
                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={2}>
                            Email
                        </Col>
                        <Col sm={10}>
                            <FormControl type="email" placeholder="Email" />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalUsername">
                        <Col componentClass={ControlLabel} sm={2}>
                            Login
                        </Col>
                        <Col sm={10}>
                            <FormControl type="text" placeholder="Username" />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                        <Col componentClass={ControlLabel} sm={2}>
                            Password
                        </Col>
                        <Col sm={10}>
                            <FormControl type="password" placeholder="Password" />
                        </Col>
                    </FormGroup>

                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                            <Button type="submit" bsStyle = 'success'>
                                Register
                            </Button>
                        </Col>
                    </FormGroup>
                </Form>
            </ModalWindow>
        )
    }
}
