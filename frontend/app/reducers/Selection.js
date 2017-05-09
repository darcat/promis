import { Enum, Types, State, isObject, isArray, isSelectionElement } from '../constants/Selection';

function makeNewSelection() {
    return new Object(
    {
        type: 'MustBeSet',
        data: new Array()
    });
}

export default function SelectionReducer(state = State, action) {
    /* get data from the state */
    let active = state.active;
    let current = state.current;
    let elements = state.elements;
    let selection = elements[current];

    /* check and fix data if needed */
    if(current < 0) {
        current = 0;
    }

    if(! isArray(elements)) {
        elements = new Array();
    }

    if(! isSelectionElement(selection)) {
        selection = makeNewSelection();
    }

    /* process actions */
    switch(action.type) {
        case Enum.SelectionOpened:
            /* create new selection */
            elements[current] = makeNewSelection();

            /* update state */
            return Object.assign({}, state,
                {
                    active: true,
                    elements: elements
                });
        break;

        case Enum.SelectionSetType:
            let type = 'Unknown';

            /* determine type from payload */
            switch(String(action.payload)) {
                case Types.Rect:
                    type = Types.Rect;
                break;

                case Types.Polygon:
                    type = Types.Polygon;
                break;

                case Types.Circle:
                    type = Types.Circle;
                break;
            }

            /* set type */
            elements[current].type = type;

            /* update state */
            return Object.assign({}, state,
                {
                    elements: elements
                })
        break;

        case Enum.SelectionCancel:
            elements[current] = makeNewSelection();

            return Object.assign({}, state,
                {
                    active: false,
                    current: current,
                    elements: elements
                });
        break;

        case Enum.SelectionClosed:
            if(active) {
                let minimum = 0;

                /* define minimum element counts for various selection types */
                switch(selection.type) {
                    case Types.Polygon:
                        minimum = 3;
                    break;

                    case Types.Rect:
                    case Types.Circle:
                        minimum = 2;
                    break;

                    default:
                        /* mark unknown selection type as incomplete */
                        minimum = elements[current].data.length + 1;
                    break;
                }

                /* advance counter if needed... */
                if(elements[current].data.length >= minimum) {
                    current ++;
                }
                /* ...or flush incomplete selection (will also discard unknown type) */
                else {
                    elements[current] = makeNewSelection();
                }
            }

            return Object.assign({}, state,
                {
                    active: false,
                    current: current,
                    elements: elements
                });
        break;

        case Enum.SelectionPushElement:
            /* add new element to current selection */
            elements[current].data.push(action.payload);

            return Object.assign({}, state, { elements: elements });
        break;

        case Enum.SelectionEditElement:
        case Enum.SelectionDeleteElement:
            /* check for root index in event payload, use current index otherwise */
            let rootIndex = (action.payload.root !== undefined && isSelectionElement(elements[action.payload.root])) ? action.payload.root : current;

            /* check if we're in bounds for data array, use 0 if exceed */
            let itemIndex = action.payload.index < elements[rootIndex].data.length ? action.payload.index : 0;

            /* substitute element */
            if(action.payload.value)
                elements[rootIndex].data[itemIndex] = action.payload.value;
            /* delete element */
            else {
                elements[rootIndex].data.splice(itemIndex, 1);

                /* if it was the last element, decrement root selection */
                if(elements[rootIndex].data.length == 0) {
                    elements.splice(rootIndex, 1);

                    if(current > 0) {
                        current --;
                    }
                }
            }

            return Object.assign({}, state, {
                current: current,
                elements: elements
            });
        break;

        /* remove selection at given index, or all if index is omitted */
        case Enum.SelectionPurge:
            let purgeIndex = (action.payload !== null && isSelectionElement(elements[action.payload])) ? action.payload : null;

            if(purgeIndex !== null) {
                elements.splice(purgeIndex, 1);

                if(current > 0) {
                    current --;
                }
            }
            else {
                current = 0;
                elements = new Array();
            }

            return Object.assign({}, state, { current: current, elements: elements });
        break;

        case Enum.SelectionHighlight:
            let highlightIndex = (action.payload !== null && isSelectionElement(elements[action.payload])) ? action.payload : null;

            return Object.assign({}, state, { highlight: highlightIndex });
        break;

        default:
            return state;
        break;
    }
}
