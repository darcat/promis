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
	Polygon : 'Polygon',
	Circle  : 'Circle',
	Rect    : 'Rectangle'
};

export const State = {
    active : false, /* when selection tool is active */
    current : 0, /* current selection index */
    elements : new Array() /* storage */
};

