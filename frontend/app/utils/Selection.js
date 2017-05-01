import { stringify } from 'wellknown';
import { Types } from '../constants/Selection';
import Leaflet from 'leaflet';

const circlePoints = 18;


/* transform selection element to pure coordinates array (LngLat format) */
export const function selectionToPolygon(map, selection) {
    let coords = new Array();
    let points = new Array();
    let fixed = this.props.onSelect.fixedPoint;

    switch(selection.type) {
        case Types.Rect:
            let bounds = Leaflet.latLngBounds(selection.data[0], selection.data[1]);

            points = new Array(bounds.getNorthEast(), bounds.getNorthWest(), bounds.getSouthWest(), bounds.getSouthEast());

            points.forEach(function(point) {
                coords.push(new Array(fixed(point.lng), fixed(point.lat)));
            });
        break;

        case Types.Circle:
            let crs = map.options.crs;
            let temp = null;
            let angle = 0.0;
            let point = null;
            let project = null;
            let segments = 18;
            let unproject = null;

            if (crs === Leaflet.CRS.EPSG3857) {
                project = map.latLngToLayerPoint.bind(map);
                unproject = map.layerPointToLatLng.bind(map);
            } else { // especially if we are using Proj4Leaflet
                project = crs.projection.project.bind(crs.projection);
                unproject = crs.projection.unproject.bind(crs.projection);
            }

            let projectedCentroid = project(selection.data[0]);

            for (let i = 0; i < circlePoints - 1; i++) {
                angle -= (Math.PI * 2 / circlePoints); // clockwise
                point = new Leaflet.Point(
                    projectedCentroid.x + (selection.data[1] * Math.cos(angle)),
                    projectedCentroid.y + (selection.data[1] * Math.sin(angle))
                );

                if (i > 0 && point.equals(points[i - 1])) {
                    continue;
                }

                temp = unproject(point);
                points.push(temp);
                console.log(temp);
                coords.push(new Array(fixed(temp.lng), fixed(temp.lat)));
            }
        break;

        case Types.Polygon:
            selection.data.forEach(function(point) {
                coords.push(new Array(fixed(point[1]), fixed(point[0])));
            });
        break;
    }

    return coords;
}

/* GeoJSON coordinate format: [longitude, latitude, elevation] */
export const function selectionToWKT(obj) {
    let baseObj = { 
        type : 'GeometryCollection',
        geometries : new Array()
    };

    for(element in obj.elements) {
        baseObj.geometries.push( {
            type : 'Polygon',
            coordinates : new Array( new Array( elementToCoordinates(element) ) )
        });
    }

    return stringify(baseObj);
}