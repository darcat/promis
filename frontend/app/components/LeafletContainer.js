var React = require('react');
var ReactDOM = require('react-dom')

var Leaflet = require('leaflet');
var LeafletBing = require('leaflet-bing-layer');


require('leaflet/dist/leaflet.css');

class LeafletContainer extends React.Component {
    constructor(props) {
        super(props);

        this.map = null;
        this.params = { center: [51.5, 10.2], zoom: 4, zoomControl: false, minZoom: 1 };
        this.bingKey = 'AjsNBiX5Ely8chb5gH7nh6HLTjlQGVKOg2A6NLMZ30UhprYhSkg735u3YUkGFipk';


        this.repaint = this.repaint.bind(this);
        console.log(LeafletBing);
    }

    repaint() {
        if(this.map) {
            this.map.invalidateSize();
            this.map.fitWorld();
        }
    }

    componentDidMount() {
        /* mount to div */
        if(! this.map) this.map = Leaflet.map(this.mapNode, this.params);
        Leaflet.tileLayer.bing(this.bingKey).addTo(this.map);
        this.repaint();
        
    }
    // TODO: zero padding
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