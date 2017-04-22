import { Enum, State } from '../constants/Map';

export default function MapReducer(state = State, action) {
    switch(action.type) {
        case Enum.ZoomChanged:
            return Object.assign({}, state, { zoom: action.payload });
        break;

        case Enum.SizeChanged:
            return Object.assign({}, state, { full: action.payload });
        break;

        case Enum.DimsChanged:
            return Object.assign({}, state, { dims: { width: action.payload.width, height: action.payload.height } });
        break;

        case Enum.ModeChanged:
            return Object.assign({}, state, { flat: action.payload });
        break;

        case Enum.GridChanged:
            return Object.assign({}, state, { grid: action.payload });
        break;

        default:
            return state;
        break;
    }
}
