
// Thanks to David Collins, Geological Survey of NSW, Australia

var ol2d = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                title: 'DigitalGlobe Maps API: RECENT Imagery',
                source: new ol.source.XYZ({
                    url: 'https://api.tiles.mapbox.com/v4/digitalglobe.nal0g75k/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpb3djb3VzdTAxZmx0d204Y3MyYXg0MXMifQ.U6jfdc8LRAnQvPvnSUG7oA',
                    attribution: "© DigitalGlobe, Inc"
                })
            }),

            new ol.layer.Tile({
                title: 'DigitalGlobe Maps API: RECENT Imagery with Streets',
                source: new ol.source.XYZ({
                    url: 'https://api.tiles.mapbox.com/v4/digitalglobe.nal0mpda/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpb3djb3VzdTAxZmx0d204Y3MyYXg0MXMifQ.U6jfdc8LRAnQvPvnSUG7oA',
                    attribution: "© DigitalGlobe, Inc"
                })
            })
            ],

        view: new ol.View({
            center: ol.proj.fromLonLat([147, -33]),
            zoom: 5
        })
});

// Layer Switcher functionality courtesy:
// https://github.com/walkermatt/ol3-layerswitcher
var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: 'Legend' // Optional label for button
});
ol2d.addControl(layerSwitcher);

// 3D system ..
var ol3d = new olcs.OLCesium({map: ol2d});
var scene = ol3d.getCesiumScene();
var terrainProvider = new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world'
});
scene.terrainProvider = terrainProvider;
