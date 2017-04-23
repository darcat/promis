export const Enum = {
    SelectionOpened     : 'SelectionStart',       /* start new selection */
    SelectionClosed     : 'SelectionEnd',         /* finish selection */
    SelectionTempElement : 'SelectionTempElement',  /* new element which is not added yet (mouse event) */
    SelectionPushElement : 'SelectionPushElement',  /* append element to current selection */
    SelectionDeleteElement : 'SelectionDeleteElement',  /* remove last element from current selection */
    SelectionEditElement : 'SelectionEditElement', /* change element at given index */
    SelectionPurge : 'SelectionPurge' /* clear all selections */
};

export const State = {
    next : null, /* populated with mouse events */
    active : false, /* when selection tool is active */
    current : 0, /* current selection index */
    elements : new Array() /* storage */
};

