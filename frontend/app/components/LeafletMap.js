import React, { Component } from 'react';

import Leaflet from 'leaflet';
import LeafletBing from 'leaflet-bing-layer';
import LeafletGeodesy from 'leaflet-geodesy';

import { Types } from '../constants/Selection';
import { BingKey } from '../constants/Map'

import 'leaflet/dist/leaflet.css';

export default class LeafletContainer extends Component {
    constructor(props) {
        super(props);

        /* handles */
        this.map = null;
        this.geolines = new Array();
        this.pointHandles = new Array();
        this.shapeHandles = new Array();
        this.previewHandle = null;

        /* options */
        this.mapParams = { center: [51.5, 10.2], zoom: 4, zoomControl: false, minZoom: 1, worldCopyJump: true };
        this.bingParams = { bingMapsKey : BingKey, imagerySet : 'AerialWithLabels' };

        /* events handling */
        this.initEvents = this.initEvents.bind(this);
        this.clearEvents = this.clearEvents.bind(this);
        this.eventToPoint = this.eventToPoint.bind(this);
        this.pointToRadius = this.pointToRadius.bind(this);
        this.startDrawEvent = this.startDrawEvent.bind(this);
        this.moveDrawEvent = this.moveDrawEvent.bind(this);
        this.stopDrawEvent = this.stopDrawEvent.bind(this);

        /* update functions */
        this.repaint = this.repaint.bind(this);
        this.processSelection = this.processSelection.bind(this);

        /* drawing functions */
        this.makeShape = this.makeShape.bind(this);
        this.clearShape = this.clearShape.bind(this);
        this.previewShape = this.previewShape.bind(this);
        this.makeSelectionPoint = this.makeSelectionPoint.bind(this);
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
        this.processSelection();
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
        this.map.on('mousedown', this.startDrawEvent);
        this.map.on('mousemove', this.moveDrawEvent);
        this.map.on('mouseup',   this.stopDrawEvent);
    }

    clearEvents() {
        this.map.off('mousedown', this.startDrawEvent);
        this.map.off('mousemove', this.moveDrawEvent);
        this.map.off('mouseup',   this.stopDrawEvent);
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

    /* remove given shape from map */
    /* TODO: is assigning to null necessary? */
    clearShape(shape) {
        if(shape && 'remove' in shape) {
            shape.remove();
            shape = null;
        }
    }

    /* recursively clear an array */
    clearShapes(shapes) {
        if(shapes && 'length' in shapes) {
            while(shapes.length > 0) {
                let shape = shapes.pop();
                this.clearShape(shape);
            }
        }
    }

    /* make 3 copies of the same shape at 0 and ±360°, return an array */
    makeShapes(type, data, opts) {
        /* TODO: can we merge this with makeGeoline? */
        let shifts = [ 0, -360, 360 ];
        let shapes = new Array(shifts.length);

        for (let i = 0; i < shifts.length; i++) {
            shapes[i] = this.makeShape(type, data, opts, shifts[i]);
        }

        return shapes;
    }

    /* make shape from current selection */
    makeShape(type, data, opts, shift = 0) {
        let shape = null;
        let options = (opts !== undefined ? opts : {
            color: 'blue',
            fillColor: '#0000ff',
            fillOpacity: 0.8
        });

        switch(type) {
            case Types.Rect:
                let bounds = [ [ data[0][0], data[0][1] + shift ], [ data[1][0], data[1][1] + shift ] ];
                shape = Leaflet.rectangle(bounds, options);
            break;

            case Types.Circle:
                let center = [ data[0][0], data[0][1] + shift ];
                /* Picking up a good amount of points for approximation */
                /* TODO: currently 1 point pert 10000 meters of radius */
                options.parts = Math.trunc(data[1] / 10000)

                shape = LeafletGeodesy.circle(center, data[1], options);
            break;

            case Types.Polygon:
                /* TODO: we only support normal polygons w/o holes and multipolygons okay? */
                let points = new Array(data.length);
                for(let i = 0; i < data.length; i++) {
                    points[j] = [ data[i][0], data[i][1] + shift ];
                }
                shape = Leaflet.polygon(points, options);
            break;
        }

        if(shape) {
            shape.addTo(this.map);
        }

        return shape;
    }

    /* make preview shape */
    previewShape(newpoint) {
        let temp = null;
        let last = this.props.onSelect.getLastPoint();
        let type = this.props.onSelect.getCurrentType();

        if(last) {
            /* calc radius for circles or just assign new point */
            if(type == Types.Circle) {
                temp = this.pointToRadius(last, newpoint);
            } else {
                temp = newpoint;
            }

            /* clear last preview */
            this.clearShapes(this.previewHandle);

            /* and make new one */
            this.previewHandle = this.makeShapes(type, new Array(last, temp), {
                color: 'white',
                dashArray: '5, 10'
            });
        }
    }

    /* make anchor point of selection */
    makeSelectionPoint(location) {
        if(location) {
            let point = Leaflet.circleMarker(location, {
                weight: 2,
                color: 'yellow',
                fillColor: '#ffff00',
                fillOpacity: 0.5
            });

            point.setRadius(4);
            point.addTo(this.map);

            return point;
        }

        return null;
    }

    /* update visible areas according to current selection */
    processSelection() {
        this.clearShapes(this.previewHandle);

        this.shapeHandles.forEach(function(handle) {
            this.clearShapes(handle);
        }.bind(this));

        this.pointHandles.forEach(function(point) {
            this.clearShape(point);
        }.bind(this));

        if(this.props.selection.current > 0) {
            this.shapeHandles = new Array();
            this.pointHandles = new Array();

            this.props.selection.elements.forEach(function(selection, rootIndex) {
                if(selection.data.length) {
                    this.shapeHandles.push(this.makeShapes(selection.type, selection.data));

                    selection.data.every(function(point, itemIndex) {
                        this.pointHandles.push(this.makeSelectionPoint(point));
                        // point drag handler here

                        /* break if we've got a circle */
                        return selection.type != Types.Circle;
                    }.bind(this));
                }
            }.bind(this));
        }
    }

    /* shortcut */
    eventToPoint(e) {
        return new Array(this.props.onSelect.fixedPoint(e.latlng.lat), this.props.onSelect.fixedPoint(e.latlng.lng));
    }

    /* another shortcut */
    pointToRadius(from, to) {
        let latlng = Leaflet.latLng(from);

        return latlng.distanceTo(Leaflet.latLng(to));
    }

    startDrawEvent(e) {
        if(this.props.selection.active) {
            this.map.dragging.disable();

            this.props.onSelect.addToSelection(this.eventToPoint(e));
        }
    }

    moveDrawEvent(e) {
        if(this.props.selection.active) {
            let point = this.eventToPoint(e);

            if(this.props.onPreview)
                this.props.onPreview(point);

            this.previewShape(point);
        }
    }

    stopDrawEvent(e) {
        if(this.props.selection.active) {
            this.map.dragging.enable();

            let point = this.eventToPoint(e);

            /* add radius instead of coords if dealing with circle */
            if(this.props.onSelect.getCurrentType() == Types.Circle) {
                point = this.pointToRadius(this.props.onSelect.getLastPoint(), point);
            }

            this.props.onSelect.addToSelection(point);
            this.props.onSelect.finishSelection();
            this.props.onChange.toggleFlush();
        }
    }

    render() {
        var zoom = this.props.options.zoom;
        var height = {height: this.props.options.full ? this.props.options.dims.height : 300};

        return (
            <div>
                <div style = {height} ref = { function(node) { this.mapNode = node; }.bind(this) } id = 'leaflet'></div>
            </div>
        )
    }
}
