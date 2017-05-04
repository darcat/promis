/* Selection action types */
export const Enum = {
    SelectionOpened        : 'SelectionStart',         /* start new selection */
    SelectionClosed        : 'SelectionEnd',           /* finish selection */
    SelectionSetType       : 'SelectionSetType',       /* polygon or circle or whatever */
    SelectionPushElement   : 'SelectionPushElement',   /* append element to current selection */
    SelectionDeleteElement : 'SelectionDeleteElement', /* remove last element from current selection */
    SelectionEditElement   : 'SelectionEditElement',   /* change element at given index */
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
    current : 0,            /* current selection index */
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
