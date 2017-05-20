import { stringify } from 'wellknown';
import Leaflet from 'leaflet';
import LeafletGeodesy from 'leaflet-geodesy';

/* desired fixed point precision */
export const precision = 3;

/* Selection action types */
export const Enum = {
    SelectionOpened        : 'SelectionStart',         /* start new selection */
    SelectionClosed        : 'SelectionEnd',           /* finish selection */
    SelectionCancel        : 'SelectionDiscard',       /* discard without saving */
    SelectionSetType       : 'SelectionSetType',       /* polygon or circle or whatever */
    SelectionPushElement   : 'SelectionPushElement',   /* append element to current selection */
    SelectionDeleteElement : 'SelectionDeleteElement', /* remove last element from current selection */
    SelectionEditElement   : 'SelectionEditElement',   /* change element at given index */
    SelectionHighlight     : 'SelectionHighlight',     /* highlight element when editing */
    SelectionPurge         : 'SelectionPurge'          /* clear all selections */
};

/* Selection types */
export const Types = {
	Polygon : 'Polygon',    /* data holds points coordinates */
	Circle  : 'Circle',     /* data[0] center point, data[1] radius */
	Rect    : 'Rectangle'   /* data[0] first bound, data[1] second bound */
};

export const State = {
    active : false,         /* when selection tool is active */
    current : 0,            /* current selection element index */
    highlight : null,       /* which selection element to highlight when editing */
    elements : new Array()  /* map and ui-friendly storage */
                            /* { type : <Types>, data : Array } */
};

/* utility funcs */
export function isObject(obj) {
    return obj === Object(obj) && ! Array.isArray(obj);
}

export function isArray(arr) {
    return Array.isArray(arr);
}

export function isSelectionElement(element) {
    return isObject(element) && isArray(element.data);
}

/* make fixed point number from floating point one */
export function fixedPoint(number) {
    return parseFloat(number.toFixed(precision));
}

/* transform selection element to pure coordinates array (LngLat format) */
export function selectionToPolygon(selection) {
    let coords = new Array();
    let points = new Array();

    switch(selection.type) {
        case Types.Rect:
            let bounds = Leaflet.latLngBounds(selection.data[0], selection.data[1]);
            //let center = bounds.getCenter();

            points.push(bounds.getSouthWest());
            points.push(bounds.getSouthEast());
            points.push(bounds.getNorthEast());
            points.push(bounds.getNorthWest());
        break;

        case Types.Circle:
            let circle = LeafletGeodesy.circle(selection.data[0], selection.data[1]);

            points = circle.getLatLngs();
            points = points[0];
        break;

        case Types.Polygon:
            points = selection.data;
        break;
    }

    /* notice: WKT requires last polygon point be the same as first to close polygon */
    /* https://my.vertica.com/docs/7.1.x/HTML/Content/Authoring/Place/Spatial_Definitions/WellknownTextWKT.htm */
    points.push(points[0]);

    points.forEach(function(point) {
        let lat = fixedPoint(point.lat ? point.lat : point[0]);
        let lng = fixedPoint(point.lng ? point.lng : point[1]);

        coords.push(new Array(lng, lat));
    });

    return coords;
}

/* GeoJSON coordinate format: [longitude, latitude, elevation] */
export function selectionToWKT(obj) {
    let wkt = 'MULTIPOLYGON(';
    let items = new Array();

    /* maybe another wkt writer here, construct by hand for now */
    obj.forEach(function(element) {
        /* prepare coords */
        let flat = selectionToPolygon(element).map(function(point) {
            return point.join(' ');
        });

        /* assemble coords */
        items.push('((' + flat.join() + '))');
    });

    wkt += (items.join() + ')');

    console.log(wkt)

    return wkt;
}

/* convert manual lat/lng entry to a shape object or null if full map is selected */
export function latlngRectangle(obj) {
    let geo_SW = obj.begin;
    let geo_NE = obj.end;

    if(geo_SW[0] == -90 && geo_SW[1] == -180 &&
       geo_NE[0] == 90 && geo_NE[1] == 180) {
        return null;
    }

    return new Object({
        type: Types.Rect,
        data: new Array(geo_SW, geo_NE)
    });
}
