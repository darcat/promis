/* TODO: proper ES5/6 module */

//             AkErn6IFlYKIm4Mp34p-ayPl_zTVk6LoUyp4J9HftaB_KJdDkBV6MmOV4eWKciNF
var bingKey = 'AjsNBiX5Ely8chb5gH7nh6HLTjlQGVKOg2A6NLMZ30UhprYhSkg735u3YUkGFipk';

var GeoObject = {
    grid: false,
    isflat : true, // true: leaflet, false: cesium
    picked : false, // for point dragging
    emitter: null, // for interface updates
    polygons : [], // polygon entities
    drawing : false, // whether polygon picking mode is active
    orbits : [],
    geolines : [],
    selpoints: [[]], // intermediate selections points entities
    positions: [[]], // array of current selections (carthesian)
    selections: [[]], // array of current selections (degrees)
    currentZoom : 5,
    currentSelection: 0,
    extraPolygon: null, // preview polygon
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
        if(this.drawing && this.selections[this.currentSelection].length) {
            this.currentSelection ++;

            $.event.trigger({ type: 'selectionChanged', count: this.currentSelection });
        }

        this.polygons[this.currentSelection] = null;
        this.selpoints[this.currentSelection] = new Array();
        this.positions[this.currentSelection] = new Array();
        this.selections[this.currentSelection] = new Array();

        this.drawing = !this.drawing;

        if(this.extraPolygon && 'remove' in this.extraPolygon) this.extraPolygon.remove();
        if(Cesium.defined(this.extraPolygon)) this.cesiumhandle.entities.remove(this.extraPolygon);

        $.event.trigger({ type: 'toolsChanged', state: this.drawing });
    },

    toggleFlat : function() {
        var pos = this.getCurrentView();

        this.isflat = !this.isflat;

        if(!this.isflat) {
            /* lf2cs */
            this.scrollToView(pos.lng, pos.lat);
            this.currentZoom = this.leaflethandle.getZoom();

            for(var i = 0; i < this.selections.length; i ++) {
                this.positions[i] = new Array();

                for(var j = 0; j < this.selections[i].length; j ++) {
                    var degrees = this.selections[i][j];
                    var position = new Cesium.Cartographic(Cesium.Math.toRadians(degrees[1]), Cesium.Math.toRadians(degrees[0]));//, 5000);
                    var cartesian = this.ellipsoid.cartographicToCartesian(position);

                    this.positions[i].push(cartesian);
                }
            }
        } else {
            /* cs2lf */
            this.currentZoom = this.compatibleZoom();
            this.scrollToView(Cesium.Math.toDegrees(pos.longitude), Cesium.Math.toDegrees(pos.latitude));
        }

        for(var i = 0; i < this.currentSelection; i ++) {
            this.clearPolygon(i);
            this.makePolygon(i);
            this.updateSelectionPoints(i);
        }

        /*if(this.geolines.length) {
            this.clearGeolines();

            for(var i = 0; i < this.geolines.length; i ++)
                this.makeGeoline(this.orbits[i])
        }*/
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

    clearPolygon : function(i) {
        var index = i !== undefined ? i : this.currentSelection;
        var polygon = this.polygons[index];

        if(polygon && 'remove' in polygon) {
            polygon.remove();
        }

        if(Cesium.defined(polygon))
            this.cesiumhandle.entities.remove(polygon);

        this.polygons[index] = null;
    },

    clearGeolines : function() {
        for(var i = 0; i < this.geolines.length; i ++) {
            if(this.geolines[i] && 'remove' in this.geolines[i]) 
                this.geolines[i].remove();

            if(Cesium.defined(this.geolines[i]))
                this.cesiumhandle.entities.remove(this.geolines[i])
        }

        this.repaint();
        //this.geolines = new Array();
    },

    invertCoords : function(array) {
        return array.map(function(x) { return [x[1], x[0]] });
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
                  var gl = L.polyline(this.invertCoords(segs[j]), {
                     color: 'red'
                  });
                  gl.addTo(this.leaflethandle);
                  //this.invertCoords(segs[j])
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

    makePolygon : function(i) {
        var index = i !== undefined ? i : this.currentSelection;
        var points = this.isflat ? this.selections[index] : this.positions[index];
        var polygon = null;

        if(points.length) {
            if(this.isflat) {
                polygon = L.polygon(points, {
                    color: 'blue',
                    fillColor: '#0000ff',
                    fillOpacity: 0.8
                });

                polygon.addTo(this.leaflethandle);
            } else {
                polygon = this.cesiumhandle.entities.add({
                    polygon: {
                        hierarchy : {
                            positions : points
                        },
                        material: Cesium.Color.BLUE.withAlpha(0.6)
                    }
                });
            }
            this.polygons[index] = polygon;
        }
    },

    previewPolygon : function(newpoint) {
        var index = this.currentSelection;
        var points = this.isflat ? this.selections[index] : this.positions[index];
        var poly = null;

        if(this.isflat) {
            if(this.extraPolygon && 'remove' in this.extraPolygon) this.extraPolygon.remove();

            // actually rect
            poly = L.rectangle(points.concat([newpoint]), {
                color: 'white',
                dashArray: '5, 10'
            });

            poly.addTo(this.leaflethandle);
        } else {
            if(Cesium.defined(this.extraPolygon)) this.cesiumhandle.entities.remove(this.extraPolygon);

            poly = this.cesiumhandle.entities.add({
                polyline : {
                    positions : points.concat(newpoint),
                    width : 2,
                    loop: true,
                    material : Cesium.Color.WHITE.withAlpha(0.6)
                }
            });
        }

        this.extraPolygon = poly;
    },

    clearSelectionPoints : function(i) {
        var c = i !== undefined ? i : this.currentSelection;
        var s = this.selpoints[c];

        if(s) for(var i = 0; i < s.length; i ++) {
            var p = s[i];

            if('remove' in p) p.remove();
            if(Cesium.defined(p))
                this.cesiumhandle.entities.remove(p);
        }

        this.selpoints[c] = new Array();
    },

    discardPreviousSelection : function(i, discard = true) {
        /* if still drawing, discard current selection */
        var c = 0;

        if(i !== undefined) c = i;
        else {
            if(this.currentSelection > 0) c = this.currentSelection - 1;
        }

        this.clearSelectionPoints(c);
        this.clearPolygon(c);

        if(discard) {
            this.selections.splice(c);
            this.positions.splice(c);
            this.selpoints.splice(c);
            this.polygons.splice(c);
        }
        
        /* discard! */
        if(discard && this.currentSelection > 0) {
            this.currentSelection --;
            $.event.trigger({ type: 'selectionChanged', count: this.currentSelection });
        }

        this.repaint();
    },

    resetSelection : function() {
        for(var i = 0; i <= this.currentSelection; i ++) {
            this.discardPreviousSelection(i, false);
        }

        this.polygons = new Array();
        this.selpoints = new Array();
        this.positions = new Array();
        this.selections = new Array();
        this.currentSelection = 0;

        $.event.trigger({ type: 'selectionChanged', count: 0 });

        this.repaint();
    },

    selectionPoint : function(pos, size = 500.0, i) {
        var index = i !== undefined ? i : this.currentSelection;
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
            var point = L.circle(pos, {
                color: 'yellow',
                fillColor: '#ffff00',
                fillOpacity: 0.5,
                radius: size
            });

            point.addTo(this.leaflethandle);
        }

        // register
        this.selpoints[index].push(point);
    },

    updateSelectionPoints : function(i) {
        var index = i !== undefined ? i : this.currentSelection;
        var data = this.isflat ? this.selections[index] : this.positions[index];
        var size = this.getCameraHeight() / 200;

        this.clearSelectionPoints(index);

        if(data) for(var i = 0; i < data.length; i ++) {
            this.selectionPoint(data[i], size, index);
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

        return { 'point' : point, 'coords' : coords }
    },

    pushSelection : function(data) {
        this.selections[this.currentSelection].push(data)
    },

    popSelection : function() {
        return this.selections[this.currentSelection].pop();
    },

    pushPosition : function(data) {
        this.positions[this.currentSelection].push(data);
    },

    getSelection : function() {
        /* just flatten */
        var selection = [];

        for(var i = 0; i < this.selections.length; i ++)
            for(var j = 0; j < this.selections[i].length; j ++)
                selection.push(this.selections[i][j]);

        return selection;
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

            go.pushPosition(point);
            go.pushSelection(coords);
            go.clearPolygon();
            go.makePolygon();
            go.selectionPoint(point, size);
        }
    } else {
        //go.clearSelection();
    }
}

function clickDrawEventLeaflet(go, e) {
    if(go.drawing) {
        var bound1 = go.popSelection();
        var bound2 = e.latlng;
        var bounds = null;
        var points = null;

        /* second point is rect bound */
        if(bound1 !== undefined) {
            bounds = L.latLngBounds(bound1, bound2);
            points = [bounds.getNorthEast(), bounds.getNorthWest(), bounds.getSouthWest(), bounds.getSouthEast()];

            for(var i = 0; i < points.length; i ++)
                go.pushSelection([points[i].lat, points[i].lng]);
            
            go.clearPolygon();
            go.makePolygon();

            for(var i = 0; i < points.length; i ++)
                go.selectionPoint(points[i]);

            go.togglePick();
        } else {
            go.pushSelection([bound2.lat, bound2.lng]);
            go.selectionPoint(bound2);    
        }
    }

}

function moveDrawEventLeaflet(go, e) {
    if(go.drawing) {
        var coords = [e.latlng.lat, e.latlng.lng];

        go.callbackExec(coords);
        go.previewPolygon(coords);
    }
}

function moveDrawEventCesium(go, e) {
    if(go.drawing) {
        var position = go.cesiumCurrentPosition(e.endPosition);

        go.callbackExec(position.coords);
        go.previewPolygon(position.point);
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
        GeoObject.updateSelectionPoints(); // scale selection points
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
