/* TODO: proper ES5/6 module */

//             AkErn6IFlYKIm4Mp34p-ayPl_zTVk6LoUyp4J9HftaB_KJdDkBV6MmOV4eWKciNF
var bingKey = 'AjsNBiX5Ely8chb5gH7nh6HLTjlQGVKOg2A6NLMZ30UhprYhSkg735u3YUkGFipk';

var GeoObject = {
    grid: false,
    isflat : true, // true: leaflet, false: cesium
    picked : false, // for point dragging
    polygon : false, // polygon entity
    drawing : false, // whether polygon picking mode is active
    selpoints: [], // intermediate selection points
    positions: [], // array of current selection (carthesian)
    selection: [], // array of current selection (degrees)
    currentZoom : 5,
    ellipsoid : false,
    cartographic : false,
    cesiumhandle: false,
    leaflethandle : false,
    lastcameramove: false, // for rendering suspension

    repaint : function() {
        if(this.isflat) {
            repaintRequiredLeaflet();
        } else {
            repaintRequiredCesium();
        }
    },

    getCurrentView : function() {
        if(! this.isflat) {
            return this.ellipsoid.cartesianToCartographic(this.cesiumhandle.camera.positionWC, this.cartographic);
        } else {
            return this.leaflethandle.getCenter();
        }
        
    },

    getCameraHeight: function() {
        if(! this.isflat) {
            this.ellipsoid.cartesianToCartographic(this.cesiumhandle.camera.positionWC, this.cartographic);

            return this.cartographic.height;
        } else {
            return this.compatibleZoom();
        }
    },

    toggleGrid : function() {
        if(!this.isflat) {
            if(this.grid.alpha) {
                this.grid.alpha = 0.0;
            } else {
                this.grid.alpha = 0.3;
            }
        }

        this.repaint();
    },

    togglePick : function() {
        this.drawing = !this.drawing;
    },

    toggleFlat : function() {
        var pos = this.getCurrentView();

        this.isflat = !this.isflat;

        console.log(pos);

        if(!this.isflat) {
            /* lf2cs */
            this.scrollToView(pos.lng, pos.lat);
            this.currentZoom = this.leaflethandle.getZoom();
        } else {
            /* cs2lf */
            this.currentZoom = this.compatibleZoom();
            this.scrollToView(Cesium.Math.toDegrees(pos.longitude), Cesium.Math.toDegrees(pos.latitude));
        }
        
        this.repaint();
    },

    /* universal zoom across 2d/3d */
    compatibleZoom : function() {
        // 3009256 == 5
        if(! this.isflat) {
            return this.currentZoom * 501851;
        } else {
            return this.currentZoom;
        }
    },

    scrollToView : function(lon, lat) {
        this.repaint();

        if(! this.isflat) {
            this.cesiumhandle.camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(lon, lat, this.compatibleZoom())
            });
        } else {

            this.leaflethandle.flyTo(L.latLng(lat, lon), this.compatibleZoom());
        }
    },

    clearSelectionPoints : function(completely = false) {
        for(var i = 0; i < this.selpoints.length; i ++)
            this.cesiumhandle.entities.remove(this.selpoints[i]);

        if(completely)
            this.selpoints = [];
    },

    clearSelection : function() {
        this.selection = [];
        this.positions = [];
        this.clearSelectionPoints(true);
        this.cesiumhandle.entities.remove(this.polygon);
    },

    selectionPoint : function(pos, size = 500.0) {
        if(!self.isflat) {
            // create point and make it draggable
            var positionCBP = function() { return pos; };

            var point = this.cesiumhandle.entities.add({
                    position: new Cesium.CallbackProperty(positionCBP, false),
                    ellipse: {
                        semiMajorAxis: size,
                        semiMinorAxis: size,
                        height: 0,
                        material: Cesium.Color.YELLOW.withAlpha(0.6)
                    },
                    
                });

            /*
            var scene = this.cesiumhandle.scene;
            var picked = this.cesiumhandle.picked;
            var camera = this.cesiumhandle.camera;
            var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

            handler.setInputAction(function(click) {
                var pickedObject = scene.pick(click.position);

                if (Cesium.defined(pickedObject) && pickedObject.id === point){
                    picked = true;
                    //this.disableCameraMotion(false);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

            handler.setInputAction(function(movement) {
                if (!picked) return;

                var position = camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

            handler.setInputAction(function(movement) {
                // if picked
                picked = false;
                //this.disableCameraMotion(true);
            }, Cesium.ScreenSpaceEventType.LEFT_UP); */

            // register
            this.selpoints.push(point);
    }
    else {
            ;;;
        }
    },

    updateSelectionPoints : function() {
        var size = this.getCameraHeight() / 300;

        this.clearSelectionPoints(true);

        for(var i = 0; i < this.positions.length; i ++) {
            this.selectionPoint(this.positions[i], size);
        }

        this.repaint();
    },

    init : function(cesiumcont, leafcont, startpos) {
        // setup cesium
        Cesium.BingMapsApi.defaultKey = bingKey;

        this.cesiumhandle = new Cesium.Viewer(cesiumcont, 
        {
            infoBox: false,
            animation: false,
            timeline: false,
            scene3DOnly: true,
            baseLayerPicker: false,
            sceneModePicker: false,
            selectionIndicator: false
        });

        var layers = this.cesiumhandle.imageryLayers;

        layers.removeAll();

        var bing = layers.addImageryProvider(
            new Cesium.BingMapsImageryProvider({ url : '//dev.virtualearth.net', mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS }));
        this.grid = layers.addImageryProvider(
            new Cesium.GridImageryProvider());
        this.grid.alpha = 0.3;

        this.ellipsoid = this.cesiumhandle.scene.mapProjection.ellipsoid;
        this.cartographic = new Cesium.Cartographic();

        // get rid of camera inertia
        this.cesiumhandle.scene.screenSpaceCameraController.inertiaSpin = 0;
        this.cesiumhandle.scene.screenSpaceCameraController.inertiaZoom = 0;
        this.cesiumhandle.scene.screenSpaceCameraController.inertiaTranslate = 0;

        // setup leaflet
        var z = L.latLng(startpos[0], startpos[1]);
        this.leaflethandle = new L.Map(leafcont, { center: z, zoom: this.currentZoom });
        this.leaflethandle.addLayer(new L.BingLayer(bingKey, {type: 'AerialWithLabels'}));

        // scroll to startpos
        //this.scrollToView(startpos[0], startpos[1]);
    },
};

function clickDrawEventCesium(go, event) {
    var pickedObject = go.cesiumhandle.scene.pick(event.position);
    var point = go.cesiumhandle.camera.pickEllipsoid(event.position);

    if(go.drawing && point) {
        if(Cesium.defined(pickedObject) && pickedObject.id === go.polygon) {
            // inside polygon, don't make the point
        } else {
            var size = go.getCameraHeight() / 400;
            /*
            // for extra precision
            var ray = go.cesiumhandle.camera.getPickRay(event.position);
            var position = go.cesiumhandle.scene.globe.pick(ray, go.cesiumhandle.scene);

            if (Cesium.defined(position)) {
                var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
            }
            */
            var carrad = go.ellipsoid.cartesianToCartographic(point);
            var coords = [Cesium.Math.toDegrees(carrad.longitude), Cesium.Math.toDegrees(carrad.latitude)];

            go.positions.push(point);
            go.selection.push(coords);
            go.selectionPoint(point, size);
            go.cesiumhandle.entities.remove(go.polygon);

            go.polygon = go.cesiumhandle.entities.add({
                polygon: {
                    hierarchy : {
                        positions : go.positions
                    },
                    material: Cesium.Color.BLUE.withAlpha(0.6)
                }
            });
        }
    } else {
        go.clearSelection();
    }
}

function clickDrawEventLeaflet() {

}

function repaintRequiredCesium() {
    GeoObject.lastcameramove = Date.now();

    if(!GeoObject.cesiumhandle.useDefaultRenderLoop) {
        console.log('render resumed @' + GeoObject.lastcameramove);
        GeoObject.cesiumhandle.useDefaultRenderLoop = true;
    }
}

function repaintRequiredLeaflet() {

}

// © terriaJS
function postRenderCesium(scene, date) {
    var now = Date.now();
    var cameraMovedInLastSecond = (now - GeoObject.lastcameramove) < 1000;

    if(scene) {
        var surface = scene.globe._surface;
        var tilesWaiting = !surface._tileProvider.ready || surface._tileLoadQueueHigh.length > 0 || surface._tileLoadQueueMedium.length > 0 || surface._tileLoadQueueLow.length > 0 || surface._debug.tilesWaitingForChildren > 0;

        if (!cameraMovedInLastSecond && !tilesWaiting && scene.tweens.length === 0) {
            if(GeoObject.cesiumhandle.useDefaultRenderLoop) {
                GeoObject.cesiumhandle.useDefaultRenderLoop = false;
                console.log('render suspended @' + now);
            }
        }
    }
}

function registerCesiumEvents() {
    var viewer = GeoObject.cesiumhandle;
    var canvas = viewer.canvas;
    var handler = new Cesium.ScreenSpaceEventHandler(canvas);

    GeoObject.cesiumhandle.scene.camera.moveEnd.addEventListener(function() {
        if(GeoObject.drawing) // scale selection points
        {
            GeoObject.updateSelectionPoints();
        }
    });

    viewer.scene.postRender.addEventListener(function(scene, time)  { 
    });

    handler.setInputAction(function(click) { clickDrawEventCesium(GeoObject, click) }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // enable render back on mouse/touch events
    canvas.addEventListener('mousemove', repaintRequiredCesium, false);
    canvas.addEventListener('mousedown', repaintRequiredCesium, false);
    canvas.addEventListener('mouseup', repaintRequiredCesium, false);
    canvas.addEventListener('touchstart', repaintRequiredCesium, false);
    canvas.addEventListener('touchend', repaintRequiredCesium, false);
    canvas.addEventListener('touchmove', repaintRequiredCesium, false);

    // on pointer events
    if (window.PointerEvent) {
        canvas.addEventListener('pointerdown', repaintRequiredCesium, false);
        canvas.addEventListener('pointerup', repaintRequiredCesium, false);
        canvas.addEventListener('pointermove', repaintRequiredCesium, false);
    }

    // shut down render sometimes
    viewer.scene.postRender.addEventListener(postRenderCesium);
}

function registerEvents() {
    registerCesiumEvents();
}