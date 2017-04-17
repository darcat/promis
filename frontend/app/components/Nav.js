var React = require('react');
var Bootstrap = require('react-bootstrap');

var Nav = Bootstrap.Nav;
var Navbar = Bootstrap.Navbar;
var NavDropdown = Bootstrap.NavDropdown;
var MenuItem = Bootstrap.MenuItem;
var Button = Bootstrap.Button;
var ButtonToolbar = Bootstrap.ButtonToolbar;

var ModalWindow = require('./Modal');

class LoginWindow extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ModalWindow show = {this.props.show} onClose = {this.props.onClose} title = 'Login'>
                some stuff
            </ModalWindow>
        )
    }
}

class RegisterWindow extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ModalWindow show = {this.props.show} onClose = {this.props.onClose} title = 'Register'>
                register
            </ModalWindow>
        )
    }
}

class PromisNavbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            user: null,
            login: false,
            register: false
        }

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
                    { this.state.user ? (
                    <ButtonToolbar>
                        <span className = 'welcome'>Hello, {this.state.user} </span>
                        <Button bsStyle="warning">Sign out</Button>
                    </ButtonToolbar>
                    ) : (
                    <ButtonToolbar>
                        <Button onClick = {this.toggleWindow.bind(null, 'login', true)} bsStyle="success">Sign in</Button>
                        <Button onClick = {this.toggleWindow.bind(null, 'register', true)} bsStyle="primary">Register</Button>
                        <LoginWindow show = {this.state.login} onClose = {this.toggleWindow.bind(null, 'login', false)} />
                        <RegisterWindow show = {this.state.register} onClose = {this.toggleWindow.bind(null, 'register', false)} />
                    </ButtonToolbar>
                    ) }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

module.exports = PromisNavbar;
