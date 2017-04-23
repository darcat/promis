import React, { Component } from 'react';

import Leaflet from 'leaflet';
import LeafletBing from 'leaflet-bing-layer';

import { BingKey } from '../constants/Map'

import 'leaflet/dist/leaflet.css';

export default class LeafletContainer extends Component {
    constructor(props) {
        super(props);

        this.map = null;
        this.mapParams = { center: [51.5, 10.2], zoom: 4, zoomControl: false, minZoom: 1 };
        this.bingParams = { bingMapsKey : BingKey, imagerySet : 'AerialWithLabels' };

        this.repaint = this.repaint.bind(this);
        this.initEvents = this.initEvents.bind(this);
        this.clearEvents = this.clearEvents.bind(this);
        this.moveDrawEvent = this.moveDrawEvent.bind(this);
        this.clickDrawEvent = this.clickDrawEvent.bind(this);
    }

    /* update only for fullscreen toggling */
    shouldComponentUpdate(nextProps) {
        return (nextProps.options.full !== this.props.options.full) ||
               (this.props.options.dims.width !== nextProps.options.dims.width ||
                this.props.options.dims.height !== nextProps.options.dims.height);
    }

    repaint() {
        if(this.map) {
            this.map.invalidateSize();
        }
    }

    componentWillReceiveProps(nextProps) {
        this.repaint();
    }

    componentDidUpdate() {
        this.repaint();
    }

    componentDidMount() {
        /* mount to div */
        if(! this.map) {
            this.map = Leaflet.map(this.mapNode, this.mapParams);
            Leaflet.tileLayer.bing(this.bingParams).addTo(this.map);
        }

        this.initEvents();
        this.repaint();
    }

    componentWillUnmount() {
        this.clearEvents();
    }

    initEvents() {
        this.map.on('click', this.clickDrawEvent);
        this.map.on('mousemove', this.moveDrawEvent);
    }

    clearEvents() {
        this.map.off('click', this.clickDrawEvent);
        this.map.off('click', this.moveDrawEvent);
    }

    clickDrawEvent(e) {

    }

    moveDrawEvent(e) {
        if(this.props.selection.active) {
            var coords = [e.latlng.lat, e.latlng.lng];

            this.props.onPreview(coords);
            //go.previewPolygon(coords);
        }
    }

    render() {
        var zoom = this.props.options.zoom;
        var height = {height: this.props.options.full ? this.props.options.dims.height : 300};

        return (
            <div>
                <div style = {height} ref={ function(node) { this.mapNode = node; }.bind(this) } id = 'leaflet'></div>
            </div>
        )
    }
}
