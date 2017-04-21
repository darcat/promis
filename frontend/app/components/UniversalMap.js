var React = require('react');
var Bootstrap = require('react-bootstrap');
var Dimensions = require('react-dimensions');

var CesiumContainer = require('./CesiumMap');
var LeafletContainer = require('./LeafletMap');
var MapZoomBox = require('./MapZoomBox');
var MapToolbox = require('./MapToolBox');
var Panel = require('./Panel');

//import Panel from './Panel';

class UniversalMap extends React.Component {
    constructor(props) {
        super(props);

        this.updateMap = this.updateMap.bind(this);
        this.determineStyle = this.determineStyle.bind(this);
    }

    updateMap() {

    }

    determineStyle(options) {
        var styles = {
            position: 'relative'
        };

        if(this.props.options.full) {
            styles.display = 'block';
            styles.zIndex = 9999;
            styles.position = 'fixed';
            styles.top = 0;
            styles.right = 0;
            styles.left = 0;
            styles.bottom = 0;
            styles.overflow = 'auto';
            styles.width = options.dims[0];
            styles.height = options.dims[1];
        }

        return styles;
    }

    render() {
        var actions = this.props.actions;
        var options = this.props.options;
        var selection = this.props.selection;
        var mapStyles = this.determineStyle(options);

        return (
            <Panel disableDrag = {options.full} title = 'Map' className = 'mapPanel'>
                <div style = {mapStyles}>
                    <div className = 'mapContainer'>
                        <MapZoomBox onChange = {actions.toggleZoom} defaultZoom = {options.defaultZoom} />
                        <MapToolbox onChange = {actions} options = {options} />
                        { options.flat ? (
                        <LeafletContainer onChange = {actions.updateMap} options = {options} selection = {selection} />
                        ) : (
                        <CesiumContainer onChange = {actions.updateMap} options = {options} selection = {selection} />
                        ) }
                    </div>
                </div>
            </Panel>
        );
    }
}


module.exports = UniversalMap;