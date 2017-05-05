import React, { Component } from 'react';

import { toDegrees } from 'cesium/Source/Core/Math';
import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
import Color from 'cesium/Source/Core/Color';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Matrix4 from 'cesium/Source/Core/Matrix4';
import Rectangle from 'cesium/Source/Core/Rectangle';
import defined from 'cesium/Source/Core/defined';
import BingMapsApi from 'cesium/Source/Core/BingMapsApi';
import BingMapsStyle from 'cesium/Source/Scene/BingMapsStyle';
import BingMapsImageryProvider from 'cesium/Source/Scene/BingMapsImageryProvider';
import GridImageryProvider from 'cesium/Source/Scene/GridImageryProvider';
import Cartographic from 'cesium/Source/Core/Cartographic';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import CircleOutlineGeometry from 'cesium/Source/Core/CircleOutlineGeometry';
import PolylineDashMaterialProperty from 'cesium/Source/DataSources/PolylineDashMaterialProperty';

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

        /* main handle */
        this.viewer = null;

        /* object handles */
        this.geolines = new Array();
        this.pointHandles = new Array();
        this.shapeHandles = new Array();
        this.previewHandle = null;

        /* for render suspension */
        this.lastmove = Date.now();
        this.lastmatrix = new Matrix4();

        /* shape funcs */
        this.makeShape = this.makeShape.bind(this);
        this.clearShape = this.clearShape.bind(this);
        this.polyEntity = this.polyEntity.bind(this);
        this.previewShape = this.previewShape.bind(this);
        this.circleCartesian = this.circleCartesian.bind(this);
        this.makeSelectionPoint = this.makeSelectionPoint.bind(this);

        /* enable render on this events */
        this.eventHandler = null;
        this.renderEvents = new Array('mousemove', 'mousedown', 'mouseup', 'mousewheel', 'mouseclick', 'wheel', 
                                      'touchstart', 'touchmove', 'touchend', 'pointerdown', 'pointermove', 'pointerup');

        // scroll to startpos
        //this.scrollToView(startpos[0], startpos[1]);
        this.repaint = this.repaint.bind(this);
        this.currentView = this.currentView.bind(this);
        this.currentPosition = this.currentPosition.bind(this);
        this.processSelection = this.processSelection.bind(this);

        /* events */
        this.initEvents = this.initEvents.bind(this);
        this.postRender = this.postRender.bind(this);
        this.clearEvents = this.clearEvents.bind(this);
        this.justDrawEvent = this.justDrawEvent.bind(this);
        this.moveDrawEvent = this.moveDrawEvent.bind(this);
        
    }

    /* update only for fullscreen toggling */
    shouldComponentUpdate(nextProps) {
        return (nextProps.options.full !== this.props.options.full) ||
               (this.props.options.dims.width !== nextProps.options.dims.width ||
                this.props.options.dims.height !== nextProps.options.dims.height);
    }

    componentWillReceiveProps(nextProps) {
        this.processSelection();
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
        this.processSelection();
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

    /* to be called only when drawing */
    currentPosition(position) {
        let point = this.viewer.camera.pickEllipsoid(position);
        let coords = null;
        let carrad = null;

        if(point) {
            //if(Cesium.defined(pickedObject) && pickedObject.id === go.polygon) {
            //inside polygon, don't make the point (or make?)
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

        this.viewer.scene.camera.moveEnd.addEventListener(function() {
            //GeoObject.updateSelectionPoints(); // scale selection points
        });

        /* draw events */
        this.eventHandler.setInputAction(this.justDrawEvent, ScreenSpaceEventType.LEFT_CLICK);
        this.eventHandler.setInputAction(this.moveDrawEvent, ScreenSpaceEventType.MOUSE_MOVE);

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
            let picked = this.viewer.scene.pick(event.position);
            let position = this.currentPosition(event.position);

            if(defined(picked) && picked.id === this.previewHandle) {
                /* inside polygon, don't make the point */
            } else {
                this.props.onSelect.addToSelection(position.coords);
            }
        }
    }

    moveDrawEvent(event) {
        if(this.props.selection.active) {
            let position = this.currentPosition(event.endPosition);

            if(position.coords) {
                if(this.props.onPreview)
                    this.props.onPreview(position.coords);

                this.previewShape(position)
            }
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
                console.log('render suspended @' + now);
                }
            }
        }

        Matrix4.clone(scene.camera.viewMatrix, this.lastmatrix);
    }

    clearShape(shape) {
        if(defined(shape)) 
            this.viewer.entities.remove(shape);
    }

    /* circle to coordinates */
    circleCartesian (center, radius) {
        let geometry = CircleOutlineGeometry.createGeometry(new CircleOutlineGeometry({
            ellipsoid: this.ellipsoid,
            center: center,
            radius: radius
        }));

        let count = 0, value, values = [];

        for(; count < geometry.attributes.position.values.length; count += 3) {
            value = geometry.attributes.position.values;
            values.push(new Cartesian3(value[count], value[count + 1], value[count + 2]));
        }

        return values;
    }

    /* polyline entity shortcut */
    polyEntity(pos, mat) {
        return new Object({
            polyline: {
                positions: pos,
                width: 4,
                material: mat
            }
        });
    }

    makeShape(type, data, mat, prev) {
        let shape = null;
        let preview = (prev !== undefined ? prev : false);
        let material = (mat !== undefined ? mat : Color.BLUE.withAlpha(0.6));

        switch(type) {
            case Types.Rect:
                let west = Math.min(data[0][1], data[1][1]), /* minimal lng */
                   south = Math.min(data[0][0], data[1][0]), /* minimal lat */
                    east = Math.max(data[1][1], data[1][1]), /* maximal lng */
                   north = Math.max(data[0][0], data[1][0])  /* maximal lat */

                shape = this.viewer.entities.add( preview ? this.polyEntity(Rectangle.fromDegrees(west, south, east, north), material) : {
                    rectangle : {
                        coordinates : Rectangle.fromDegrees(west, south, east, north),
                        material : material,
                    }
                });
            break;

            case Types.Circle:
                let circle = this.circleCartesian(Cartesian3.fromDegrees(data[0][1], data[0][0]), data[1]);

                shape = this.viewer.entities.add( preview ? this.polyEntity(circle, material) : {
                    position: Cartesian3.fromDegrees(data[0][1], data[0][0]),
                    ellipse: {
                        semiMajorAxis: data[1],
                        semiMinorAxis: data[1],
                        height: 0,
                        material: material
                    }
                });
            break;

            case Types.Polygon:
                let lonlat = new Array();

                data.forEach(function(latlon){
                    lonlat.push(latlon[1]);
                    lonlat.push(latlon[0]);
                });

                shape = this.viewer.entities.add( preview ? this.polyEntity(Cartesian3.fromDegreesArray(lonlat), material) : {
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

        if(last) {
            /* ensure we have valid data */
            if(! Array.isArray(data)) {
                data = new Array();
            }

            /* calc radius for circles or just assign new point */
            if(type == Types.Circle) {
                let a = Cartesian3.fromDegrees(last[1], last[0]);
                let b = newpoint.point;

                temp = new Array(last, Cartesian3.distance(a, b));
            } else {
                temp = data.concat(new Array(newpoint.coords));
            }

            /* clear last preview */
            this.clearShape(this.previewHandle);

            /* and make new one */
            this.previewHandle = 
                this.makeShape(type,
                               temp,
                               Color.WHITE.withAlpha(0.85),
                               /*new PolylineDashMaterialProperty({
                                   color: Color.WHITE.withAlpha(0.75)
                               }),*/ 
                               false//true
                );
        }
    }

    makeSelectionPoint() {

    }

    processSelection() {
        if(! this.props.selection.active) {
            this.clearShape(this.previewHandle);

            this.shapeHandles.forEach(function(handle) {
                this.clearShape(handle);
            }.bind(this));

            this.pointHandles.forEach(function(point) {
                this.clearShape(point);
            }.bind(this));

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
