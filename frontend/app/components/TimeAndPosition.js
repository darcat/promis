var React = require('react');
var Bootstrap = require('react-bootstrap');

var Col = Bootstrap.Col;
var Row = Bootstrap.Row;
var Form = Bootstrap.Form;
var FormGroup = Bootstrap.FormGroup;
var Glyphicon = Bootstrap.Glyphicon;
var InputGroup = Bootstrap.InputGroup;
var FormControl = Bootstrap.FormControl;
var ControlLabel = Bootstrap.ControlLabel;

var Toggle = require('react-bootstrap-toggle').default;

require(__dirname + '/../styles/map.css');

function GeoInputForm(props) {
    return (
        <div>
        <FormGroup controlId = 'Altitude'>
            <Col componentClass={ControlLabel} sm={2}>
                Altitude
            </Col>
            <Col sm={5}>
                <InputGroup>
                    <InputGroup.Addon>From</InputGroup.Addon>
                    <FormControl type="number" />
                </InputGroup>
            </Col>
            <Col sm={5}>
                <InputGroup>
                    <InputGroup.Addon>To</InputGroup.Addon>
                    <FormControl type="number" />
                </InputGroup>
            </Col>
        </FormGroup>
        <FormGroup controlId = 'Latitude'>
            <Col componentClass={ControlLabel} sm={2}>
                Latitude
            </Col>
            <Col sm={5}>
                <InputGroup>
                    <InputGroup.Addon>From</InputGroup.Addon>
                    <FormControl type="number" />
                </InputGroup>
            </Col>
            <Col sm={5}>
                <InputGroup>
                    <InputGroup.Addon>To</InputGroup.Addon>
                    <FormControl type="number" />
                </InputGroup>
            </Col>
        </FormGroup>
        <FormGroup controlId = 'Longitude'>
            <Col componentClass={ControlLabel} sm={2}>
                Longitude
            </Col>
            <Col sm={5}>
                <InputGroup>
                    <InputGroup.Addon>From</InputGroup.Addon>
                    <FormControl type="number" />
                </InputGroup>
            </Col>
            <Col sm={5}>
                <InputGroup>
                    <InputGroup.Addon>To</InputGroup.Addon>
                    <FormControl type="number" />
                </InputGroup>
            </Col>
        </FormGroup>
        </div>
    );
}

function MapSelection(props) {
    if (props.length) {
        return (
            <ul className = 'mapSelectionItems'>
            { props.items.map(function(item) {
                return (
                    <li key = {item.lng}>{item}</li>
                )
            }) }    
            </ul>
        );
    } else return (
        <p>Selection is empty</p>
    );   
}

class TimeAndPositionInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            useMap: false,
            mapAreas: []
        };

        this.toggleMap = this.toggleMap.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onChange = this.props.onChange;
    }

    handleChange() {
        /* smth */
        if(this.onChange) this.onChange();
    }

    toggleMap() {
        this.setState(function(){
            return {
                useMap: !this.state.useMap
            }
        });
    }

    render() {
        return (
            <Form horizontal>
                <FormGroup controlId = 'TimeAndDate'>
                    <Col componentClass={ControlLabel} sm={2}>
                        Interval
                    </Col>
                    <Col sm={10}>
                        <FormControl type="text" placeholder="Interval [stub]" />
                    </Col>
                </FormGroup>
                <FormGroup controlId = 'InputType'>
                    <Col componentClass={ControlLabel} sm={2}>
                        Input
                    </Col>
                    <Col sm={10}>
                        <Toggle onClick = {this.toggleMap} 
                            on = {<span><Glyphicon glyph = 'screenshot' /> Use map</span>}
                            off = {<span><Glyphicon glyph = 'list-alt' /> Manual</span>}
                            active = {this.state.useMap} 
                        />
                    </Col>
                </FormGroup>
                { ! this.state.useMap ? (
                <GeoInputForm />) : (
                <FormGroup controlId = 'MapSelection'>
                    <Col componentClass = {ControlLabel} sm = {2}>
                        Selection
                    </Col>
                    <Col sm = {10}>
                        <MapSelection items = {this.state.mapAreas} />
                    </Col>
                </FormGroup>) }
            </Form>
        )
    }
}

module.exports = TimeAndPositionInput;
