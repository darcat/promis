import React, { Component } from 'react';

import { toDegrees } from 'cesium/Source/Core/Math';
import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
import Color from 'cesium/Source/Core/Color';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Matrix4 from 'cesium/Source/Core/Matrix4';
import NearFarScalar from 'cesium/Source/Core/NearFarScalar';
import Rectangle from 'cesium/Source/Core/Rectangle';
import defined from 'cesium/Source/Core/defined';
import BingMapsApi from 'cesium/Source/Core/BingMapsApi';
import BingMapsStyle from 'cesium/Source/Scene/BingMapsStyle';
import BingMapsImageryProvider from 'cesium/Source/Scene/BingMapsImageryProvider';
import GridImageryProvider from 'cesium/Source/Scene/GridImageryProvider';
import Cartographic from 'cesium/Source/Core/Cartographic';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';

import Material from 'cesium/Source/Scene/Material';
import Primitive from 'cesium/Source/Scene/Primitive';
import CircleGeometry from 'cesium/Source/Core/CircleGeometry';
import PolygonGeometry from 'cesium/Source/Core/PolygonGeometry';
import GeometryInstance from 'cesium/Source/Core/GeometryInstance';
import EllipsoidSurfaceAppearance from 'cesium/Source/Scene/EllipsoidSurfaceAppearance';

import PolylineOutlineMaterialProperty from 'cesium/Source/DataSources/PolylineOutlineMaterialProperty';

import EventEmitter from 'wolfy87-eventemitter';
import { BingKey } from '../constants/Map';
import { Types } from '../constants/Selection';

import 'cesium/Source/Widgets/widgets.css';

export default class CesiumContainer extends Component {
    constructor(props) {
        super(props);

        /* map options */
        BingMapsApi.defaultKey = BingKey;

        this.options = {
            infoBox: false,
            animation: false,
            timeline: false,
            homeButton: false,
            scene3DOnly: true,
            fullscreenButton: false,
            baseLayerPicker: false,
            sceneModePicker: false,
            selectionIndicator: false
        }

        /* ee */
        this.ee = new EventEmitter();

        /* main handle */
        this.viewer = null;

        /* object handles */
        this.pointHandles = new Array();
        this.shapeHandles = new Array();
        this.geolineHandles = new Array();
        this.previewHandle = null;

        /* for render suspension */
        this.lastmove = Date.now();
        this.lastmatrix = new Matrix4();

        /* shape funcs & utils */
        this.safePick = this.safePick.bind(this);
        this.makeShape = this.makeShape.bind(this);
        this.clearShape = this.clearShape.bind(this);
        this.makeGeoline = this.makeGeoline.bind(this);
        this.previewShape = this.previewShape.bind(this);
        this.pointToRadius = this.pointToRadius.bind(this);
        this.makeSelectionPoint = this.makeSelectionPoint.bind(this);

        /* enable render on this events */
        this.eventHandler = null;
        this.renderEvents = new Array('mousemove', 'mousedown', 'mouseup', 'mousewheel', 'mouseclick', 'wheel', 
                                      'touchstart', 'touchmove', 'touchend', 'pointerdown', 'pointermove', 'pointerup');

        // scroll to startpos
        //this.scrollToView(startpos[0], startpos[1]);
        this.repaint = this.repaint.bind(this);
        this.updateMap = this.updateMap.bind(this);
        this.currentView = this.currentView.bind(this);
        this.currentPosition = this.currentPosition.bind(this);

        /* events */
        this.initEvents = this.initEvents.bind(this);
        this.postRender = this.postRender.bind(this);
        this.clearEvents = this.clearEvents.bind(this);
        this.justDrawEvent = this.justDrawEvent.bind(this);
        this.moveDrawEvent = this.moveDrawEvent.bind(this);
        this.stopDrawEvent = this.stopDrawEvent.bind(this);
        this.voidDrawEvent = this.voidDrawEvent.bind(this);
        
    }

    /* update only for fullscreen toggling */
    shouldComponentUpdate(nextProps) {
        return (nextProps.options.full !== this.props.options.full) ||
               (this.props.options.dims.width !== nextProps.options.dims.width ||
                this.props.options.dims.height !== nextProps.options.dims.height);
    }

    componentWillReceiveProps(nextProps) {
        this.updateMap();
        this.repaint();
    }

    componentDidUpdate() {
        this.repaint();
    }

    componentWillUnmount() {
        this.clearEvents();

        this.map = null;
    }

    componentDidMount() {
        /* mount to div */
        if(! this.viewer) {
            this.viewer = new Viewer(this.mapNode, this.options);

            this.viewer.imageryLayers.removeAll();

            this.bing = this.viewer.imageryLayers.addImageryProvider(
                new BingMapsImageryProvider({ url : '//dev.virtualearth.net', mapStyle: BingMapsStyle.AERIAL_WITH_LABELS }));
            this.grid = this.viewer.imageryLayers.addImageryProvider(
                new GridImageryProvider());
            this.grid.alpha = 0.0;

            this.ellipsoid = this.viewer.scene.mapProjection.ellipsoid;
            this.cartographic = new Cartographic();

            /* get rid of camera inertia */
            this.viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
            this.viewer.scene.screenSpaceCameraController.inertiaZoom = 0;
            this.viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;

            this.initEvents();
        }

        this.repaint();
        this.updateMap();
    }

    repaint() {
        if(this.viewer) {
            this.lastmove = Date.now();

            if(! this.viewer.useDefaultRenderLoop) {
                this.viewer.useDefaultRenderLoop = true;
                //console.log('render resumed @', this.lastmove);
            }
        }
    }

    currentView() {
        return this.ellipsoid.cartesianToCartographic(this.viewer.camera.positionWC, this.cartographic);
    }

    /* ensures picked point doesn't belong to any objects */
    safePick(position) {
        return true;//!defined(this.viewer.scene.pick(position));
    }

    /* to be called only when drawing */
    currentPosition(position) {
        let point = this.viewer.camera.pickEllipsoid(position);
        let coords = null;
        let carrad = null;

        if(point) {
            carrad = this.ellipsoid.cartesianToCartographic(point);
            coords = [
                        this.props.onSelect.fixedPoint(toDegrees(carrad.latitude)),
                        this.props.onSelect.fixedPoint(toDegrees(carrad.longitude))
                    ];
        }

        return { 'point' : point, 'coords' : coords }
    }

    initEvents() {
        this.eventHandler = new ScreenSpaceEventHandler(this.viewer.canvas);

        /* draw events */
        this.eventHandler.setInputAction(this.justDrawEvent, ScreenSpaceEventType.LEFT_CLICK);
        this.eventHandler.setInputAction(this.moveDrawEvent, ScreenSpaceEventType.MOUSE_MOVE);
        this.eventHandler.setInputAction(this.stopDrawEvent, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.eventHandler.setInputAction(this.voidDrawEvent, ScreenSpaceEventType.RIGHT_CLICK);

        /* shut down render sometimes */
        this.viewer.scene.postRender.addEventListener(this.postRender);

        /* enable render back */
        this.renderEvents.forEach(function(eventname) {
            this.viewer.canvas.addEventListener(eventname, this.repaint, false);
        }.bind(this));
    }

    clearEvents() {
        this.renderEvents.forEach(function(eventname) {
            this.viewer.canvas.removeEventListener(eventname, this.repaint, false);
        }.bind(this));

        this.eventHandler = this.eventHandler && this.eventHandler.destroy();
    }

    justDrawEvent(event) {
        if(this.props.selection.active) {
            let last = this.props.onSelect.getLastPoint();
            let type = this.props.onSelect.getCurrentType();
            let position = this.currentPosition(event.position);

            if(this.safePick(event.position)) {
                if(last && type == Types.Circle) {
                    this.props.onSelect.addToSelection(this.pointToRadius(last, position.point));
                    this.props.onSelect.finishSelection();
                    this.props.onChange.toggleFlush();
                } else {
                    this.pointHandles.push(this.makeSelectionPoint(position.coords));
                    this.props.onSelect.addToSelection(position.coords);
                }
            }
        }
    }

    moveDrawEvent(event) {
        if(this.props.selection.active) {
            let position = this.currentPosition(event.startPosition);

            if(position.coords) {
                this.ee.emitEvent('nextPoint', position.coords);
                this.previewShape(position)
            }
        }
    }

    stopDrawEvent(event) {
        if(this.props.selection.active) {
            let position = this.currentPosition(event.position);

            if(position.coords) {
                this.props.onSelect.addToSelection(position.coords);
                this.props.onSelect.finishSelection();
                this.props.onChange.toggleFlush();
            }
        }
    }

    voidDrawEvent(event) {
        if(this.props.selection.active) {
            this.props.onSelect.discardSelection();
            this.props.onChange.toggleFlush();
        }
    }

    /* © terriaJS */
    postRender(scene, date) {
        var now = Date.now();

        if (!Matrix4.equalsEpsilon(this.lastmatrix, scene.camera.viewMatrix, 1e-5)) {
            this.lastmove = now;
        }

        var cameraMovedInLastSecond = (now - this.lastmove) < 1000;

        if(scene) {
            var surface = scene.globe._surface;
            var tilesWaiting = !surface._tileProvider.ready || surface._tileLoadQueueHigh.length > 0 || surface._tileLoadQueueMedium.length > 0 || surface._tileLoadQueueLow.length > 0 || surface._debug.tilesWaitingForChildren > 0;

            if (!cameraMovedInLastSecond && !tilesWaiting && scene.tweens.length === 0) {
                if(this.viewer.useDefaultRenderLoop) {
                    this.viewer.useDefaultRenderLoop = false;
                    //console.log('render suspended @' + now);
                }
            }
        }

        Matrix4.clone(scene.camera.viewMatrix, this.lastmatrix);
    }

    clearShape(shape) {
        if(defined(shape)) 
            this.viewer.entities.remove(shape);
    }

    /* distance between latlon and cartesian */
    pointToRadius(first, second) {
        return Cartesian3.distance(Cartesian3.fromDegrees(first[1], first[0]), second);
    }

    makeShape(type, data) {
        let shape = null;
        let material = Color.BLUE.withAlpha(0.6);

        switch(type) {
            case Types.Rect:
                let west = Math.min(data[0][1], data[1][1]), /* minimal lng */
                   south = Math.min(data[0][0], data[1][0]), /* minimal lat */
                    east = Math.max(data[1][1], data[1][1]), /* maximal lng */
                   north = Math.max(data[0][0], data[1][0])  /* maximal lat */

                shape = this.viewer.entities.add({
                    rectangle : {
                        coordinates : Rectangle.fromDegrees(west, south, east, north),
                        material : material,
                    }
                });
            break;

            case Types.Circle:
                shape = this.viewer.entities.add({
                        position: Cartesian3.fromDegrees(data[0][1], data[0][0]),
                        ellipse: {
                            semiMajorAxis: data[1],
                            semiMinorAxis: data[1],
                            height: 0,
                            material: material
                        }
                    }
                );
            break;

            case Types.Polygon:
                let lonlat = new Array();

                data.forEach(function(latlon){
                    lonlat.push(latlon[1]);
                    lonlat.push(latlon[0]);
                });

                shape = this.viewer.entities.add({
                    polygon: {
                        hierarchy : {
                            positions : Cartesian3.fromDegreesArray(lonlat)
                        },
                        material: material
                    }
                });
            break;
        }

        return shape;
    }

    previewShape(newpoint) {
        let temp = null;
        let last = this.props.onSelect.getLastPoint();
        let type = this.props.onSelect.getCurrentType();
        let data = this.props.onSelect.getCurrentData();
        let geometry = null;

        if(last) {
            /* ensure we have valid data */
            if(! Array.isArray(data)) {
                data = new Array();
            }

            /* calc radius for circles or just assign new point */
            /*
            if(type == Types.Circle) {
                temp = new Array(last, );
            } else {
                temp = data.concat(new Array(newpoint.coords));
            }*/

            /* clear last preview */
            this.previewHandle && this.viewer.scene.primitives.remove(this.previewHandle);

            /* and make new one */
            switch(type) {
                case Types.Circle:
                    geometry = new CircleGeometry({
                        center : Cartesian3.fromDegrees(last[1], last[0]),
                        radius : this.pointToRadius(last, newpoint.point),
                        vertexFormat : EllipsoidSurfaceAppearance.VERTEX_FORMAT
                    });
                break;

                case Types.Polygon:
                    let deg = new Array();

                    data.concat(new Array(newpoint.coords)).forEach(function(latlon){
                        deg.push(latlon[1]);
                        deg.push(latlon[0]);
                    });

                    geometry = new PolygonGeometry.fromPositions({
                        positions : Cartesian3.fromDegreesArray(deg),
                        vertexFormat : EllipsoidSurfaceAppearance.VERTEX_FORMAT
                    });
                break;
            }

            this.previewHandle = new Primitive({
                geometryInstances : new GeometryInstance({
                    geometry: geometry,
                    id: new Object({})
                }),
                allowPicking : false,
                asynchronous : false,
                appearance : new EllipsoidSurfaceAppearance({
                    material : Material.fromType('Stripe')
                })
            });

            this.viewer.scene.primitives.add(this.previewHandle);
        }
    }

    makeSelectionPoint(latlon) {
        return this.viewer.entities.add({
            position : Cartesian3.fromDegrees(latlon[1], latlon[0]),
            point : {
                show : true,
                color : Color.YELLOW.withAlpha(0.5),
                pixelSize : 10,
                scaleByDistance : new NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
                outlineColor : Color.YELLOW,
                outlineWidth : 3
            }
        });
    }

    makeGeoline(data) {
        let cartesians = new Array();

        /* data is [lat, lon, hgt] */
        data.forEach(function(point) {
            cartesians.push(Cartesian3.fromDegrees(point[1], point[0], point[2] ? point[2] : 250000));
        });

        return this.viewer.entities.add({
            polyline : {
                positions : cartesians,
                width : 5,
                material : new PolylineOutlineMaterialProperty({
                    color : Color.ORANGE,
                    outlineWidth : 2,
                    outlineColor : Color.BLACK
                })
            }
        });
    }

    updateMap() {
        if(! this.props.selection.active) {
            /* clear geolines */
            this.geolineHandles.forEach(function(handle) {
                this.clearShape(handle);
            }.bind(this));

            /* draw new geolines if they're present */
            if(Array.isArray(this.props.geolines) && this.props.geolines.length > 0) {
                this.geolineHandles = new Array();

                this.props.geolines.forEach(function(geoline){
                    this.geolineHandles.push(this.makeGeoline(geoline));
                }.bind(this));
            }

            /* clear preview */
            this.previewHandle && this.viewer.scene.primitives.remove(this.previewHandle);

            /* clear shapes */
            this.shapeHandles.forEach(function(handle) {
                this.clearShape(handle);
            }.bind(this));

            /* clear selection points */
            this.pointHandles.forEach(function(point) {
                this.clearShape(point);
            }.bind(this));

            /* render new selection */
            if(this.props.selection.current > 0) {
                this.shapeHandles = new Array();
                this.pointHandles = new Array();

                this.props.selection.elements.forEach(function(selection, rootIndex) {
                    if(selection.data.length) {
                        this.shapeHandles.push(this.makeShape(selection.type, selection.data));

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

    render() {
        var height = {height: this.props.options.full ? this.props.options.dims.height : 300};

        return (
            <div>
                <div style = {height} ref={ function(node) { this.mapNode = node; }.bind(this) } id = 'cesium'></div>
            </div>
        )
    }
}
