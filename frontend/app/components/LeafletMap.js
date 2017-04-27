import React, { Component } from 'react';

import Leaflet from 'leaflet';
import LeafletBing from 'leaflet-bing-layer';

import { BingKey } from '../constants/Map'

import 'leaflet/dist/leaflet.css';

export default class LeafletContainer extends Component {
    constructor(props) {
        super(props);

        this.map = null;
        this.geolines = new Array();
        this.precision = 3;
        this.pointsHandles = new Array();
        this.polygonHandles = new Array();

        this.previewCircleHandle = null;
        this.previewRectangleHandle = null;

        this.mapParams = { center: [51.5, 10.2], zoom: 4, zoomControl: false, minZoom: 1 };
        this.bingParams = { bingMapsKey : BingKey, imagerySet : 'AerialWithLabels' };

        this.fpoint = this.fpoint.bind(this);
        this.repaint = this.repaint.bind(this);
        this.initEvents = this.initEvents.bind(this);
        this.clearEvents = this.clearEvents.bind(this);
        this.moveDrawEvent = this.moveDrawEvent.bind(this);
        this.clickDrawEvent = this.clickDrawEvent.bind(this);
        this.processSelection = this.processSelection.bind(this);

        this.getPoints = this.getPoints.bind(this);
        this.getCurrent = this.getCurrent.bind(this);

        this.makePolygon = this.makePolygon.bind(this);
        this.clearPolygon = this.clearPolygon.bind(this);
        this.makeSelectionPoint = this.makeSelectionPoint.bind(this);
        this.clearSelectionPoint = this.clearSelectionPoint.bind(this);
        this.previewRectangle = this.previewRectangle.bind(this);
        this.previewCircle = this.previewCircle.bind(this);
        this.removePreview = this.removePreview.bind(this);
    }

    /* update only for fullscreen toggling */
    shouldComponentUpdate(nextProps) {
        return (nextProps.options.full !== this.props.options.full) ||
               (this.props.options.dims.width !== nextProps.options.dims.width ||
                this.props.options.dims.height !== nextProps.options.dims.height);
    }

    fpoint(number) {
        return parseFloat(number.toFixed(this.precision));
    }

    repaint() {
        if(this.map) {
            this.map.invalidateSize();
        }
    }

    componentWillReceiveProps(nextProps) {
        this.processSelection(nextProps.selection);
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
        this.processSelection();
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

    makeGeoline(coords)
    {
        var gl = null;

        /* First point of the segment that we're currently adding */
        var anchor = 0;
        for (var i = 1; i < coords.length; i++) {
          /* If it's the last point or there is a -180/180 jump, add what we have */
          if (i + 1 == coords.length || Math.abs(coords[i][1] - coords[i - 1][1]) > 90) {
            var sliced = coords.slice(anchor, i);

            /* If we are not adding the final segment, add the current point
               mirrored, e.g. -170 is +190 and so on. */
            if (i + 1 < coords.length) {
              var mirror = coords[i].slice();
              var s = Math.sign(mirror[1]);
              mirror[1] = mirror[1] - s * 360;
              sliced.push(mirror)
            }


            /* Utility that creates shift functions for longitude */
            var shifter = function(s) {
              return function(x) {
                return [ x[0], x[1] + s ];
              };
            }

            /* Adding the segment, then the same one shifted +360°/-360° */
            var segs = [ sliced, sliced.map(shifter(360)), sliced.map(shifter(-360)) ];
            for (var j = 0; j < segs.length; j++) {
              var gl = Leaflet.polyline(this.invertCoords(segs[j]), {
                 color: 'red'
              });
              gl.addTo(this.leaflethandle);
              //this.invertCoords(segs[j])
            }

            /* Recording new anchor, if it was the last point it wouldn't matter anyway */
            anchor = i;
            }
        }

        this.geolines.push(gl);
    }

    clearGeolines() {
        if(this.geolines.length) this.geolines.map(function(geoline) {
            if(geoline && 'remove' in geoline)
                geoline.remove();
        });

        this.geolines = new Array();
    }

    /* get (current) selection points */
    getPoints(i) {
        var index = (i !== undefined ? i : this.props.selection.current);

        return this.props.selection.elements[index];
    }

    /* get current selection index */
    getCurrent() {
        return this.props.selection.current;
    }

    /* make polygon from selection current or given index */
    makePolygon(i) {
        var polygon = Leaflet.polygon(
            this.getPoints(i),
            {
                color: 'blue',
                fillColor: '#0000ff',
                fillOpacity: 0.8
            });

        polygon.addTo(this.map);

        return polygon;
    }

    /* remove given polygon from map */
    clearPolygon(i) {
        var index = (i !== undefined ? i : this.getCurrent());
        var polygon = this.polygonHandles[index];

        if(polygon && 'remove' in polygon) polygon.remove();

        polygon = null;
    }

    /* make anchor point of selection */
    makeSelectionPoint(location, size = 500) {
        if(location) {
            var point = Leaflet.circle(location, {
                color: 'yellow',
                fillColor: '#ffff00',
                fillOpacity: 0.5,
                radius: size
            });

            point.addTo(this.map);

            return point;
        }

        return null;
    }

    /* clear anchor point */
    clearSelectionPoint(point) {
        if(point && 'remove' in point) point.remove();

        point = null;
    }

    removePreview() {
        if(this.previewRectangleHandle && 'remove' in this.previewRectangleHandle) this.previewRectangleHandle.remove();
        if(this.previewCircleHandle && 'remove' in this.previewCircleHandle) this.previewCircleHandle.remove();

    }
    /* delete old preview rect and make new one */
    previewRectangle(newpoint) {
        this.removePreview();

        var points = this.getPoints();
        var rect = Leaflet.rectangle(points.concat([newpoint]), {
                color: 'white',
                dashArray: '5, 10'
            });

        rect.addTo(this.map);

        this.previewRectangleHandle = rect;
    }

    /* delete old preview circle and make new one */
    previewCircle(newpoint) {
        this.removePreview();

        var start = this.getPoints()[0];

        if(start) {
            var where = Leaflet.latLng(start);
            var radius = where.distanceTo(Leaflet.latLng(newpoint));

            console.log(radius);
            var circle = Leaflet.circle(where, radius, {
                            color: 'white',
                            dashArray: '5, 10'
                        });

            circle.addTo(this.map);

            this.previewCircleHandle = circle;
        }
    }

    /* update visible areas according to (current) selection */
    processSelection(particular) {
        var selection = (particular !== undefined ? particular : this.props.selection);

        this.removePreview();

        this.polygonHandles.forEach(function(handle, index) {
            this.clearPolygon(index);
        }.bind(this));

        this.pointsHandles.forEach(function(point) {
            this.clearSelectionPoint(point);
        }.bind(this));

        if(selection.current > 0) {
            this.polygonHandles = new Array();
            this.pointsHandles = new Array();

            this.props.selection.elements.forEach(function(selection, index) {
                this.polygonHandles.push(this.makePolygon(index));

                selection.forEach(function(point) {
                    this.pointsHandles.push(this.makeSelectionPoint(point));
                }.bind(this));
            }.bind(this));
        }
    }

    clickDrawEvent(e) {
        if(this.props.selection.active) {
            var bound1 = this.getPoints().pop();
            var bound2 = e.latlng;
            var bounds = null;
            var points = null;

            /* make rect or circle */
            if(bound1 !== undefined) {
                if(this.props.options.rect) {
                    bounds = Leaflet.latLngBounds(bound1, bound2);
                    points = [bounds.getNorthEast(), bounds.getNorthWest(), bounds.getSouthWest(), bounds.getSouthEast()];

                    for(var i = 0; i < points.length; i ++)
                        this.props.onSelect.addToSelection([this.fpoint(points[i].lat), this.fpoint(points[i].lng)]);
                }
                if(this.props.options.round) {
                    // TODO: proper calculations!
                    var center = bound1;
                    var radius = 10; //bound2.distanceTo(bound1);

                    for (var i = 0; i < 180; i += 10) {
                        var angle = 2.1 + (i * Math.PI / 90);

                        var lat = center[0] + Math.sin(angle) * radius;
                        var lng = center[1] + Math.cos(angle) * radius;

                        this.props.onSelect.addToSelection([this.fpoint(lat), this.fpoint(lng)]);
                    }
                }

                this.props.onSelect.finishSelection();
                this.props.onChange.toggleFlush();
            } else {
                this.props.onSelect.addToSelection([this.fpoint(bound2.lat), this.fpoint(bound2.lng)]);
            }
        }
    }

    moveDrawEvent(e) {
        if(this.props.selection.active) {
            var coords = new Array(this.fpoint(e.latlng.lat), this.fpoint(e.latlng.lng));

            if(this.props.onPreview)
                this.props.onPreview(coords);

            if(this.props.options.rect)
                this.previewRectangle(coords);
            if(this.props.options.round)
                this.previewCircle(coords);
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
