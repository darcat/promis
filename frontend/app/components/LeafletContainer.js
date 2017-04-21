var React = require('react');
var ReactDOM = require('react-dom')

var Leaflet = require('leaflet');
var LeafletBing = require('leaflet-bing-layer');

var BingKey = 'AjsNBiX5Ely8chb5gH7nh6HLTjlQGVKOg2A6NLMZ30UhprYhSkg735u3YUkGFipk';

require('leaflet/dist/leaflet.css');

class LeafletContainer extends React.Component {
    constructor(props) {
        super(props);

        this.map = null;
        this.mapParams = { center: [51.5, 10.2], zoom: 4, zoomControl: false, minZoom: 1 };
        this.bingParams = { bingMapsKey : BingKey, imagerySet : 'AerialWithLabels' };

        this.repaint = this.repaint.bind(this);
    }

    repaint() {
        if(this.map) {
            this.map.invalidateSize();
            this.map.fitWorld();
        }
    }

    componentDidMount() {
        /* mount to div */
        if(! this.map) {
            this.map = Leaflet.map(this.mapNode, this.mapParams);
            Leaflet.tileLayer.bing(this.bingParams).addTo(this.map);
            this.repaint();
        }
    }

    render() {
        var zoom = this.props.options.zoom;

        return (
            <div>
                <div ref={ function(node) { this.mapNode = node; }.bind(this) } id = 'leaflet'></div>
            </div>
        )
    }
}

module.exports = LeafletContainer;