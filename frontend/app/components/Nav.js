import React, { Component } from 'react';
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Button, ButtonToolbar } from 'react-bootstrap';

import LoginWindow from './LoginWindow';
import RegisterWindow from './RegisterWindow';

export default class PromisNavbar extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            user: null,
            login: false,
            register: false
        }

        /*
        axios.get('promis/isloggedin').then(function(response){
            if(response.user)
                this.setState({user: response.user })
            else
                this.setState({user: null});
        })*/
        this.toggleWindow = this.toggleWindow.bind(this);
    }

    toggleWindow(what, state) {
        var newState = {};

        this.setState(function(){
            newState[what] = state;

            return newState;
        })
    }

    render() {
        return (
            <Navbar inverse collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="#">IONOSAT PROMIS</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavDropdown eventKey={3} title="Language" id="basic-nav-dropdown">
                            <MenuItem eventKey={3.1}>English</MenuItem>
                            <MenuItem eventKey={3.2}>Ukrainian</MenuItem>
                        </NavDropdown>
                    </Nav>
                    <Nav pullRight>
                        <NavItem>
                        { this.state.user ? (
                        <div>
                            <span className = 'welcome'>Hello, {this.state.user} </span>
                            <Button bsStyle="warning">Sign out</Button>
                        </div>
                        ) : (
                        <ButtonToolbar>
                            <Button onClick = {this.toggleWindow.bind(null, 'login', true)} bsStyle="success">Sign in</Button>
                            <Button onClick = {this.toggleWindow.bind(null, 'register', true)} bsStyle="primary">Register</Button>
                            <LoginWindow show = {this.state.login} onClose = {this.toggleWindow.bind(null, 'login', false)} />
                            <RegisterWindow show = {this.state.register} onClose = {this.toggleWindow.bind(null, 'register', false)} />
                        </ButtonToolbar>
                        ) }
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}
