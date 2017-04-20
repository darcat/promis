var React = require('react');
var Bootstrap = require('react-bootstrap');

var ButtonGroup = Bootstrap.ButtonGroup;
var ToolboxButton = require('./ToolboxButton');

class MapToolBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isflat: true,
            fullscreen : false
        }

        this.toggleFlat = this.toggleFlat.bind(this);
    }

    toggleFlat() {
        this.setState(function() {
            return {
                isflat: ! this.state.isflat
            }
        });
    }

    componentDidUpdate() {

    }

    render() {
        return (
            <div className = 'maptoolbox'>
                <ButtonGroup>
                    <ToolboxButton onClick = {this.toggleFlat} active = {!this.state.isflat} icon = 'globe' help = 'Switch to 3D' />
                    <ToolboxButton icon = 'edit' help = 'Select area' />
                    <ToolboxButton icon = 'screenshot' help = 'Select area' />
                    <ToolboxButton icon = 'th' help = 'Toggle grid' />
                    <ToolboxButton icon = 'resize-full' help = 'Fullscreen' />
                    <ToolboxButton icon = 'erase' help = 'Erase last selection' />
                    <ToolboxButton icon = 'ban-circle' help = 'Clear all selection' />
                </ButtonGroup>
            </div>
        )
    }
}

module.exports = MapToolBox;