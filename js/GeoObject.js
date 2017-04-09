/* TODO: proper ES5/6 module */

//             AkErn6IFlYKIm4Mp34p-ayPl_zTVk6LoUyp4J9HftaB_KJdDkBV6MmOV4eWKciNF
var bingKey = 'AjsNBiX5Ely8chb5gH7nh6HLTjlQGVKOg2A6NLMZ30UhprYhSkg735u3YUkGFipk';

var GeoObject = {
    grid: false,
    isflat : true, // true: leaflet, false: cesium
    picked : false, // for point dragging
    polygon : false, // polygon entity
    drawing : false, // whether polygon picking mode is active
    geolines : [],
    selpoints: [], // intermediate selection points
    positions: [], // array of current selection (carthesian)
    selection: [], // array of current selection (degrees)
    currentZoom : 5,
    totalPoints: 0,
    ellipsoid : false,
    cartographic : false,
    cesiumhandle: false,
    leaflethandle : false,
    callbackFunction : function() { },
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
        if(this.drawing) {
            // ;;;
        }

        this.drawing = !this.drawing;
    },

    toggleFlat : function() {
        var pos = this.getCurrentView();

        this.isflat = !this.isflat;

        if(!this.isflat) {
            /* lf2cs */
            this.scrollToView(pos.lng, pos.lat);
            this.currentZoom = this.leaflethandle.getZoom();

            for(var i = 0; i < this.selection.length; i ++) {
                var position = new Cesium.Cartographic(Cesium.Math.toRadians(this.selection[i][1]), Cesium.Math.toRadians(this.selection[i][0]));//, 5000);
                var cartesian = this.ellipsoid.cartographicToCartesian(position);
                this.positions.push(cartesian);
            }
        } else {
            /* cs2lf */
            this.currentZoom = this.compatibleZoom();
            this.scrollToView(Cesium.Math.toDegrees(pos.longitude), Cesium.Math.toDegrees(pos.latitude));
        }

        this.totalPoints = this.selection.length;
        this.updateSelectionPoints();
        this.clearPolygon();
        this.makePolygon();
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

    clearPolygon : function() {
        // clear everywhere
        if(this.polygon && 'remove' in this.polygon)
            this.polygon.remove();

        if(Cesium.defined(this.polygon))
            this.cesiumhandle.entities.remove(this.polygon);
    },

    clearGeolines : function() {
        for(var i = 0; i < this.geolines.length; i ++) {
            if(this.geolines[i] && 'remove' in this.geolines[i])
                this.geolines[i].remove();

            if(Cesium.defined(this.geoline[i]))
                this.cesiumhandle.entities.remove(this.geolines[i])
        }
    },

    makeGeoline : function(coords) {
        var gl = null;

        if(this.isflat) {
            /* First point of the segment that we're currently adding */
            anchor = 0;
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
                  var gl = L.polyline(segs[j], {
                     color: 'red'
                  });
                  gl.addTo(this.leaflethandle);
                }

                /* Recording new anchor, if it was the last point it wouldn't matter anyway */
                anchor = i;
              }
            }
        } else {
            var hc = new Array();

            // convert latlon to lonlathgt
            for(var i = 0; i < coords.length; i ++) {
                hc.push(Cesium.Cartesian3.fromDegrees(coords[i][1], coords[i][0], 250000));
            }

            var gl = this.cesiumhandle.entities.add({
                        polyline : {
                            positions : hc,
                            width : 5,
                            material : new Cesium.PolylineOutlineMaterialProperty({
                                color : Cesium.Color.ORANGE,
                                outlineWidth : 2,
                                outlineColor : Cesium.Color.BLACK
                            })
                        }
            });
        }

        this.geolines.push(gl);
    },

    makePolygon : function() {
        if(this.totalPoints) {
            if(this.isflat) {
                this.polygon = L.polygon(this.selection, {
                    color: 'blue',
                    fillColor: '#0000ff',
                    fillOpacity: 0.8
                });
                this.polygon.addTo(this.leaflethandle);

            } else {
                this.polygon = this.cesiumhandle.entities.add({
                    polygon: {
                        hierarchy : {
                            positions : this.positions
                        },
                        material: Cesium.Color.BLUE.withAlpha(0.6)
                    }
                });
            }
        }
    },

    clearSelection : function() {
        this.selection = [];
        this.positions = [];
        this.clearSelectionPoints(true);
        this.clearPolygon();
        this.repaint();
    },

    clearSelectionPoints : function(completely = false) {
        if(this.totalPoints) {
            for(var i = 0; i < this.totalPoints; i ++) {
                // clear everywhere
                if('remove' in this.selpoints[i]) this.selpoints[i].remove();
                if(Cesium.defined(this.selpoints[i]))
                    this.cesiumhandle.entities.remove(this.selpoints[i]);
            }

            if(completely) {
                this.totalPoints = this.selection.length;
                this.selpoints = [];
            }
        }
    },

    incrementPoint : function() {
        this.totalPoints ++;

        if(this.totalPoints > 4096) {
            alert('Really?');
            this.totalPoints = 0;
        }
    },

    selectionPoint : function(pos, size = 500.0) {
        var point = null;

        if(!this.isflat) {
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
            var point = L.circle(pos, size, {
                color: 'yellow',
                fillColor: '#ffff00',
                fillOpacity: 0.5,
            });

            point.addTo(this.leaflethandle);
        }

        // register
        this.selpoints.push(point);
    },

    updateSelectionPoints : function() {
        var size = this.getCameraHeight() / 200;

        this.clearSelectionPoints(true);

        for(var i = 0; i < this.totalPoints; i ++) {
            this.selectionPoint(this.isflat ? this.selection[i] : this.positions[i], size);
        }

        this.repaint();
    },

    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    polyContains : function(point, vs) {
        var x = point.lat, y = point.lng;
        var i = false;

        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i].lat, yi = vs[i].lng;
            var xj = vs[j].lat, yj = vs[j].lng;

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if (intersect) i = !i;
        }

        return i;
    },

    /* to be called only when drawing */
    cesiumCurrentPosition : function(position) {
        var pickedObject = this.cesiumhandle.scene.pick(position);
        var point = this.cesiumhandle.camera.pickEllipsoid(position);
        var coords = null;
        var carrad = null;

        if(point) {
            //if(Cesium.defined(pickedObject) && pickedObject.id === go.polygon) {
            //inside polygon, don't make the point (or make?)
            carrad = this.ellipsoid.cartesianToCartographic(point);
            coords = [Cesium.Math.toDegrees(carrad.latitude), Cesium.Math.toDegrees(carrad.longitude)];
        }

        return { 'points': point, 'coords' : coords }
    },

    init : function(cesiumcont, leafcont, startpos, movecallback) {
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

        this.callbackFunction = movecallback;

        var layers = this.cesiumhandle.imageryLayers;

        layers.removeAll();

        var bing = layers.addImageryProvider(
            new Cesium.BingMapsImageryProvider({ url : '//dev.virtualearth.net', mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS }));
        this.grid = layers.addImageryProvider(
            new Cesium.GridImageryProvider());
        this.grid.alpha = 0.0;

        this.ellipsoid = this.cesiumhandle.scene.mapProjection.ellipsoid;
        this.cartographic = new Cesium.Cartographic();

        // get rid of camera inertia
        this.cesiumhandle.scene.screenSpaceCameraController.inertiaSpin = 0;
        this.cesiumhandle.scene.screenSpaceCameraController.inertiaZoom = 0;
        this.cesiumhandle.scene.screenSpaceCameraController.inertiaTranslate = 0;

        // setup leaflet
        var z = L.latLng(startpos[0], startpos[1]);
        this.leaflethandle = new L.Map(leafcont, { center: z, zoom: this.currentZoom, minZoom: 1 });
        this.leaflethandle.addLayer(new L.BingLayer(bingKey, {type: 'AerialWithLabels'}));

        // scroll to startpos
        this.scrollToView(startpos[0], startpos[1]);
    },

    callbackExec : function(params) {
        this.callbackFunction(params);
    }
};

function clickDrawEventCesium(go, event) {
    var pickedObject = go.cesiumhandle.scene.pick(event.position);

    if(go.drawing) {
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
            var position = go.cesiumCurrentPosition(event.position);
            var point = position.point, coords = position.coords;

            go.positions.push(point);
            go.selection.push(coords);
            go.selectionPoint(point, size);
            go.incrementPoint();
            go.clearPolygon();
            go.makePolygon()
        }
    } else {
        //go.clearSelection();
    }
}

function clickDrawEventLeaflet(go, e) {
    if(go.drawing) {
        pos = e.latlng;

        // forbid inner points
        if(/*! go.polyContains(pos, go.selection) */true) {
            go.selection.push([pos.lat, pos.lng]);
            go.selectionPoint(pos);
            go.incrementPoint();
            go.clearPolygon();
            go.makePolygon();
        }
    }

}

function moveDrawEventLeaflet(go, e) {
    if(go.drawing) {
        go.callbackExec([e.latlng.lat, e.latlng.lng]);
    }
}

function moveDrawEventCesium(go, e) {
    if(go.drawing) {
        var position = go.cesiumCurrentPosition(e.endPosition);

        go.callbackExec(position.coords);
    }
}

function repaintRequiredCesium() {
    GeoObject.lastmove = Date.now();

    if(!GeoObject.cesiumhandle.useDefaultRenderLoop) {
        //console.log('render resumed @' + GeoObject.lastmove);
        GeoObject.cesiumhandle.useDefaultRenderLoop = true;
    }
}

function repaintRequiredLeaflet() {
    GeoObject.leaflethandle.invalidateSize();
    GeoObject.leaflethandle.fitBounds(GeoObject.leaflethandle.getBounds())
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
                //console.log('render suspended @' + now);
            }
        }
    }

    Cesium.Matrix4.clone(scene.camera.viewMatrix, GeoObject.lastmatrix);
}

function registerLeafletEvents() {
    GeoObject.leaflethandle.on('click', function(c) { clickDrawEventLeaflet(GeoObject, c); });
    GeoObject.leaflethandle.on('mousemove', function(c) { moveDrawEventLeaflet(GeoObject, c); });
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
    handler.setInputAction(function(event) { moveDrawEventCesium(GeoObject, event) }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

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
