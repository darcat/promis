import React, { Component } from 'react';


import Math from 'cesium/Source/Core/Math';
import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
import Matrix4 from 'cesium/Source/Core/Matrix4';
import defined from 'cesium/Source/Core/defined';
import BingMapsApi from 'cesium/Source/Core/BingMapsApi';
import BingMapsStyle from 'cesium/Source/Scene/BingMapsStyle';
import BingMapsImageryProvider from 'cesium/Source/Scene/BingMapsImageryProvider';
import GridImageryProvider from 'cesium/Source/Scene/GridImageryProvider';
import Cartographic from 'cesium/Source/Core/Cartographic';

import { BingKey } from '../constants/Map';

import 'cesium/Source/Widgets/widgets.css';

export default class CesiumContainer extends Component {
    constructor(props) {
        super(props);

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

        this.viewer = null;
        this.lastmove = Date.now();

        // scroll to startpos
        //this.scrollToView(startpos[0], startpos[1]);
        this.repaint = this.repaint.bind(this);
    }

    repaint() {
        if(this.viewer) {
            this.lastmove = Date.now();

            if(! this.viewer.useDefaultRenderLoop) {
                this.viewer.useDefaultRenderLoop = true;
            }
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
        }

        this.repaint();
    }

    render() {
        var height = {height: this.props.options.full ? this.props.options.dims[1] : 300};

        return (
            <div>
                <div style = {height} ref={ function(node) { this.mapNode = node; }.bind(this) } id = 'cesium'></div>
            </div>
        )
    }
}
