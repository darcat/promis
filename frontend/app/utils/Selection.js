import { stringify } from 'wellknown';
import { Types } from '../constants/Selection';

/* GeoJSON coordinate format: [longitude, latitude, elevation] */

export const function elementToCoordinates(element) {
    switch(element.type) {
        case Types.Rect:
        break;

        case Types.Polygon:
        break;

        case Types.Circle:
        break;
    }
}

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