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
             /* advance index if something has been selected */
            var currentIndex = Array.isArray(state.elements[state.current]) ?
                               (state.elements[state.current].length ? state.current + 1 : state.current) : state.current;

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

        case Enum.SelectionDeleteElement:
            /* create ref */
            var ref = state.elements;

            /* check if we're in bounds */
            var index = action.payload < ref[state.current].length ? action.payload : 0;

            /* pop last element */
            ref[state.current].splice(index, 1);

            return Object.assign({}, state, { elements: ref });
        break;

        case Enum.SelectionEditElement:
            /* create ref */
            var ref = state.elements;

            /* check if we're in bounds */
            var index = action.payload.index < ref[state.current].length ? action.payload.index : 0;

            /* substitute element */
            ref[state.current][index] = action.payload.value;

            return Object.assign({}, state, { elements: ref });
        break;

        case Enum.SelectionPurge:
            return Object.assign({}, state, { current: 0, elements: new Array() });
        break;

        default:
            return state;
        break;
    }
}
