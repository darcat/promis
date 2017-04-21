var React = require('react');
var Bootstrap = require('react-bootstrap');
var ReactBounds = require('react-bounds');

var CesiumContainer = require('./CesiumContainer');
var LeafletContainer = require('./LeafletContainer');
var MapZoomBox = require('./MapZoomBox');
var MapToolbox = require('./MapToolBox');
var Panel = require('./Panel');

//import Panel from './Panel';

class UniversalMap extends React.Component {
    constructor(props) {
        super(props);

        this.updateMap = this.updateMap.bind(this);
    }

    updateMap() {

    }



    render() {
        var actions = this.props.actions;
        var options = this.props.options;
        var classes = 'mapPanel' + (options.full ? ' panelFullscreen' : '');
        var selection = this.props.selection;

        return (
            <Panel title = 'Map' className = {classes}>
                <div className = 'mapContainer'>
                    <MapZoomBox onChange = {actions.toggleZoom} defaultZoom = {options.defaultZoom} />
                    <MapToolbox onChange = {actions} options = {options} />
                    { options.flat ? (
                    <LeafletContainer onChange = {actions.updateMap} options = {options} selection = {selection} />
                    ) : (
                    <CesiumContainer onChange = {actions.updateMap} options = {options} selection = {selection} />
                    ) }
                </div>
            </Panel>
        );
    }
}


module.exports = UniversalMap;