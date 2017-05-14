import { stringify } from 'wellknown';
import { Types, fixedPoint } from '../constants/Selection';
import Leaflet from 'leaflet';
import LeafletGeodesy from 'leaflet-geodesy';


//export const function polygon(lat1, lng1, lat2, lng2)

/* transform selection element to pure coordinates array (LngLat format) */
export function selectionToPolygon(selection) {
    let coords = new Array();
    let points = new Array();
    //let fixed = this.props.onSelect.fixedPoint;

    switch(selection.type) {
        case Types.Rect:
            let bounds = Leaflet.latLngBounds(selection.data[0], selection.data[1]);

            points = new Array(bounds.getNorthEast(), bounds.getNorthWest(), bounds.getSouthWest(), bounds.getSouthEast());

            points.forEach(function(point) {
                coords.push(new Array(fixedPoint(point.lng), fixedPoint(point.lat)));
            });
        break;

        case Types.Circle:
            let circle = LeafletGeodesy.circle(selection.data[0], selection.data[1]);

            points = circle.getLatLngs();

            points.forEach(function(point) {
                console.log(point.lat, point.lng)
                if(point.lat && point.lng) coords.push(new Array(fixedPoint(point.lng), fixedPoint(point.lat)));
            });
        break;

        case Types.Polygon:
            selection.data.forEach(function(point) {
                coords.push(new Array(fixedPoint(point[1]), fixedPoint(point[0])));
            });
        break;
    }

    return coords;
}

/* GeoJSON coordinate format: [longitude, latitude, elevation] */
export function selectionToWKT(obj) {
    let baseObj = { 
        type : 'GeometryCollection',
        geometries : new Array()
    };

    obj.elements.forEach(function(element) {
        baseObj.geometries.push( {
            type : 'Polygon',
            coordinates : new Array( new Array( selectionToPolygon(element) ) )
        });
    });

    return stringify(baseObj);
}