var React = require('react');
var Modal = require('react-bootstrap').Modal;

class ModalWindow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: props.show
        }

        this.toggle = this.toggle.bind(this);
        this.callback = props.onClose;
    }

    toggle (show) {
        this.setState({ show: show });

        if(this.callback) this.callback();
    }

    /*
    componentWillReceiveProps(nextProps) {
        if(this.state.show != nextProps.show) this.setState(function(){
            return {
                show: nextProps.show
            }
        })
    }*/

    render() {
        return (
            <Modal show={this.props.show} onHide={this.toggle.bind(null, false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.props.children}
                </Modal.Body>
            </Modal>
        )
    }
}

ModalWindow.defaultProps = {
    show : false
}

module.exports = ModalWindow;