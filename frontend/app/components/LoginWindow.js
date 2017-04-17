var React = require('react');
var Bootstrap = require('react-bootstrap');

var Col = Bootstrap.Col;
var Form = Bootstrap.Form;
var Button = Bootstrap.Button;
var FormGroup = Bootstrap.FormGroup;
var ControlLabel = Bootstrap.ControlLabel;
var FormControl = Bootstrap.FormControl;

var ModalWindow = require('./Modal');

class LoginWindow extends React.Component {
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

module.exports = LoginWindow;