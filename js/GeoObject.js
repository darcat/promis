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
    totalPoints: 0,
    ellipsoid : false,
    cartographic : false,
    cesiumhandle: false,
    leaflethandle : false,
    lastmove: Date.now(), // for rendering suspension
    lastmatrix: new Cesium.Matrix4(), // same

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
        if(this.drawing)
            this.clearSelection();

        this.drawing = !this.drawing;
    },

    toggleFlat : function() {
        var pos = this.getCurrentView();

        this.isflat = !this.isflat;

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
        for(var i = 0; i < totalPoints; i ++) {
            if(this.isflat) {
                this.leaflethandle.selpoints[i].remove();
            } else {
                this.cesiumhandle.entities.remove(this.selpoints[i]);
            }
        }

        if(completely) {
            this.totalPoints = 0;
            this.selpoints = [];
        }
    },

    clearPolygon : function() {
        if(this.isflat) {
            this.polygon.remove();
        } else {
            cesiumhandle.entities.remove(this.polygon);
        }
    },

    clearSelection : function() {
        this.selection = [];
        this.positions = [];
        this.clearSelectionPoints(true);
        this.clearPolygon();
        this.repaint();
    },

    selectionPoint : function(pos, size = 500.0) {
        var point = null;

        if(!self.isflat) {
            // create point
            var positionCBP = function() { return pos; };

            point = this.cesiumhandle.entities.add({
                    position: new Cesium.CallbackProperty(positionCBP, false),
                    ellipse: {
                        semiMajorAxis: size,
                        semiMinorAxis: size,
                        height: 0,
                        material: Cesium.Color.YELLOW.withAlpha(0.6)
                    },
                    
                });
        } else {
            var point = L.circle(pos, {
                color: 'yellow',
                fillColor: '#ffff03',
                fillOpacity: 0.5,
                radius: size
            });

            point.addTo(this.leaflethandle);
        }

        // register
        this.selpoints.push(point);
        this.totalPoints ++;
    },

    updateSelectionPoints : function() {
        var size = this.getCameraHeight() / 200;

        this.clearSelectionPoints(true);

        for(var i = 0; i < totalPoints; i ++) {
            this.selectionPoint(this.isflat ? this.selection[i] : this.positions[i], size);
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
            homeButton: false,
            scene3DOnly: true,
            fullscreenButton: false,
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
        this.scrollToView(startpos[0], startpos[1]);
    }
};

function clickDrawEventCesium(go, event) {
    var pickedObject = go.cesiumhandle.scene.pick(event.position);
    var point = go.cesiumhandle.camera.pickEllipsoid(event.position);

    if(go.drawing && point) {
        if(Cesium.defined(pickedObject) && pickedObject.id === go.polygon) {
            // inside polygon, don't make the point
        } else {
            var size = go.getCameraHeight() / 300;
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
            go.selectionPoint(coords, size);
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
        //go.clearSelection();
    }
}

function clickDrawEventLeaflet(go, e) {
    if(go.drawing) {
        pos = e.latlng;

        go.selectionPoint(pos);
    }

}

function repaintRequiredCesium() {
    GeoObject.lastmove = Date.now();

    if(!GeoObject.cesiumhandle.useDefaultRenderLoop) {
        console.log('render resumed @' + GeoObject.lastmove);
        GeoObject.cesiumhandle.useDefaultRenderLoop = true;
    }
}

function repaintRequiredLeaflet() {
    

}

// © terriaJS
function postRenderCesium(scene, date) {
    var now = Date.now();

    if (!Cesium.Matrix4.equalsEpsilon(GeoObject.lastmatrix, scene.camera.viewMatrix, 1e-5)) {
        GeoObject.lastmove = now;
    }

    var cameraMovedInLastSecond = (now - GeoObject.lastmove) < 1000;

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

    Cesium.Matrix4.clone(scene.camera.viewMatrix, GeoObject.lastmatrix);
}

function registerLeafletEvents() {
    GeoObject.leaflethandle.on('click', function(c) { clickDrawEventLeaflet(GeoObject, c); });
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
    canvas.addEventListener('mousewheel', repaintRequiredCesium, false);
    canvas.addEventListener('wheel', repaintRequiredCesium, false);
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
    registerLeafletEvents();
}