import React, { Component } from 'react';

import Leaflet from 'leaflet';
import LeafletBing from 'leaflet-bing-layer';
import LeafletGeodesy from 'leaflet-geodesy';

import { Types } from '../constants/Selection';
import { BingKey } from '../constants/Map';

import 'leaflet/dist/leaflet.css';

export default class LeafletContainer extends Component {
    constructor(props) {
        super(props);

        /* handles */
        this.map = null;
        this.pointHandles = new Array();
        this.shapeHandles = new Array();
        this.geolineHandles = new Array();
        this.previewHandles = null;

        /* options */
        this.mapParams = { center: [31.5, 10.2], zoom: 1, zoomControl: false, minZoom: 1, worldCopyJump: true};
        this.bingParams = { bingMapsKey : BingKey, imagerySet : 'AerialWithLabels' };

        /* events handling */
        this.initEvents = this.initEvents.bind(this);
        this.clearEvents = this.clearEvents.bind(this);
        this.eventToPoint = this.eventToPoint.bind(this);
        this.pointToRadius = this.pointToRadius.bind(this);
        this.startDrawEvent = this.startDrawEvent.bind(this);
        this.moveDrawEvent = this.moveDrawEvent.bind(this);
        this.stopDrawEvent = this.stopDrawEvent.bind(this);
        this.voidDrawEvent = this.voidDrawEvent.bind(this);

        /* update functions */
        this.repaint = this.repaint.bind(this);
        this.updateMap = this.updateMap.bind(this);

        /* drawing functions */
        this.makeShape = this.makeShape.bind(this);
        this.clearShape = this.clearShape.bind(this);
        this.makeGeoline = this.makeGeoline.bind(this);
        this.previewShape = this.previewShape.bind(this);
        this.makeSelectionPoint = this.makeSelectionPoint.bind(this);

        /* colors */
        this.previewColor = { color: 'white', dashArray: '5, 10' };
        this.defaultColor = { color: 'blue', fillColor: '#0000ff', fillOpacity: 0.8 };
        this.geolineColor = { color: 'red' };
        this.highlightColor = { color: 'green', fillColor: '#00ff00', fillOpacity: 0.8 };
        this.selectionColor = { weight: 2, color: 'yellow', fillColor: '#ffff00', fillOpacity: 0.5 };
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
        this.updateMap(nextProps);
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
        this.updateMap();
    }

    componentWillUnmount() {
        this.clearEvents();
    }

    initEvents() {
        this.map.on('contextmenu', this.voidDrawEvent);
        this.map.on('mousedown',   this.startDrawEvent);
        this.map.on('mousemove',   this.moveDrawEvent);
        this.map.on('mouseup',     this.stopDrawEvent);
    }

    clearEvents() {
        this.map.off('contextmenu', this.voidDrawEvent);
        this.map.off('mousedown',   this.startDrawEvent);
        this.map.off('mousemove',   this.moveDrawEvent);
        this.map.off('mouseup',     this.stopDrawEvent);
    }

    makeGeoline(xcoords)
    {
        let coords = xcoords.map(function(x) { return [x[1], x[0]]; });

        /* shifted geoline components */
        let lines = new Array();

        /* First point of the segment that we're currently adding */
        let anchor = 0;

        for (let i = 1; i < coords.length; i++) {
            /* If it's the last point or there is a -180/180 jump, add what we have */
            if (i + 1 == coords.length || Math.abs(coords[i][1] - coords[i - 1][1]) > 90) {
                let sliced = coords.slice(anchor, i);

                /* If we are not adding the final segment, add the current point
                    mirrored, e.g. -170 is +190 and so on. */
                if (i + 1 < coords.length) {
                    let mirror = coords[i].slice();
                    let s = Math.sign(mirror[1]);

                    mirror[1] = mirror[1] - s * 360;
                    sliced.push(mirror)
                }


                /* Utility that creates shift functions for longitude */
                let shifter = function(s) {
                    return function(x) {
                        return [ x[0], x[1] + s ];
                    };
                }

                /* Adding the segment, then the same one shifted +360°/-360° */
                let segs = [ sliced, sliced.map(shifter(360)), sliced.map(shifter(-360)) ];

                for (let j = 0; j < segs.length; j++) {
                    let line = Leaflet.polyline(segs[j], this.geolineColor);

                    lines.push(line);
                    line.addTo(this.map);
                }

                /* Recording new anchor, if it was the last point it wouldn't matter anyway */
                anchor = i;
            }
        }

        return lines;
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
        let shapes = new Array();

        shifts.forEach(function(shift) {
            shapes.push(this.makeShape(type, data, opts, shift));
        }.bind(this));

        return shapes;
    }

    /* make shape from current selection */
    makeShape(type, data, opts, shift = 0) {
        let shape = null;
        let options = (opts !== undefined ? opts : this.defaultColor);

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
                let points = data;/*new Array(data.length);
                for(let i = 0; i < data.length; i++) {
                    points.push([ data[i][0], data[i][1] + shift ]);
                }*/
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
            this.clearShapes(this.previewHandles);

            /* and make new one */
            this.previewHandles = this.makeShapes(type, new Array(last, temp), this.previewColor);
        }
    }

    /* make anchor point of selection */
    makeSelectionPoint(location) {
        if(location) {
            let point = Leaflet.circleMarker(location, this.selectionColor);

            point.setRadius(4);
            point.addTo(this.map);

            return point;
        }

        return null;
    }

    /* update visible areas according to current state */
    updateMap(maybeProps) {
        let props = maybeProps !== undefined ? maybeProps : this.props;

        if(! props.selection.active) {
            /* clear geolines */
            this.geolineHandles.forEach(function(handle) {
                this.clearShape(handle);
            }.bind(this));

            /* draw new geolines if they're present */
            if(Array.isArray(props.options.geolines) && props.options.geolines.length > 0) {
                this.geolineHandles = new Array();

                props.options.geolines.forEach(function(geoline) {
                    this.makeGeoline(geoline).forEach(function(handle) {
                        this.geolineHandles.push(handle);
                    }.bind(this));
                }.bind(this));
            }

            /* clear old shapes */
            this.clearShapes(this.previewHandles);

            this.shapeHandles.forEach(function(handle) {
                this.clearShapes(handle);
            }.bind(this));

            /* clear old selection points */
            this.pointHandles.forEach(function(point) {
                this.clearShape(point);
            }.bind(this));

            /* if there's some selection, draw it */
            if(props.selection.current > 0) {
                this.shapeHandles = new Array();
                this.pointHandles = new Array();

                props.selection.elements.forEach(function(selection, rootIndex) {
                    if(selection.data.length) {
                        let selected = (rootIndex == props.selection.highlight ? this.highlightColor : undefined);
                        this.shapeHandles.push(this.makeShapes(selection.type, selection.data, selected));

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

            this.previewShape(point);

            if(this.props.onPreview) {
                this.props.onPreview(point);
            }
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

    voidDrawEvent(event) {
        if(this.props.selection.active) {
            this.map.dragging.enable();
            this.props.onSelect.discardSelection();
            this.props.onChange.toggleFlush();
        }
    }

    render() {
        var zoom = this.props.options.zoom;
        var height = {height: this.props.options.full ? this.props.options.dims.height : 350};

        return (
            <div>
                <div style = {height} ref = { function(node) { this.mapNode = node; }.bind(this) } id = 'leaflet'></div>
            </div>
        )
    }
}
