import { Enum, State } from '../constants/Selection';

export default function SelectionReducer(state = State, action) {
    switch(action.type) {
        case Enum.SelectionOpened:
            /* create ref */
            var ref = state.elements;

            /* create new selection */
            ref[state.current] = new Array();

            return Object.assign({}, state,
                {
                    active: true,
                    elements: ref
                });
        break;

        case Enum.SelectionClosed:
            var currentIndex = state.current;

            if(Array.isArray(state.elements[state.current])) {
                /* advance index if at least triangle has been selected... */
                if(state.elements[state.current].length > 2) {
                    currentIndex ++;
                }
                /* ...or flush incomplete selection */
                else {
                    state.elements[state.current] = new Array();
                }
            }

            return Object.assign({}, state, 
                {
                    active: false,
                    current: currentIndex
                });
        break;

        case Enum.SelectionPushElement:
            /* create ref */
            var ref = state.elements;

            /* create array in case someone decided to push before SelectionOpened */
            if(! Array.isArray(ref[state.current]))
                ref[state.current] = new Array();

            /* add new element to current selection */
            ref[state.current].push(action.payload);

            return Object.assign({}, state, { elements: ref });
        break;

        case Enum.SelectionEditElement:
        case Enum.SelectionDeleteElement:
            /* create ref and init indexes */
            var ref = state.elements;
            var idx = 0, rdx = 0;

            /* check if we're dealing with arrays */
            if(Array.isArray(ref)) {
                /* check for root index in event payload, use current index otherwise */
                rdx = (action.payload.root !== undefined && Array.isArray(ref[action.payload.root])) ? action.payload.root : state.current;

                /* check if we're in bounds */
                idx = action.payload.index < ref[rdx].length ? action.payload.index : 0;

                /* substitute element */
                if(action.payload.value)
                    ref[rdx][idx] = action.payload.value;
                /* delete element */
                else {
                    ref[rdx].splice(idx, 1);

                    /* if it was the last element, decrement root selection */
                    if(ref[rdx].length == 0) {
                        ref.splice(rdx, 1);

                        if(state.current > 0) {
                            return Object.assign({}, state, { current: state.current - 1, elements: ref });
                        }
                    }
                }

                return Object.assign({}, state, { elements: ref });
            }

            return Object.assign({}, state);
        break;

        case Enum.SelectionPurge:
            return Object.assign({}, state, { current: 0, elements: new Array() });
        break;

        default:
            return state;
        break;
    }
}
