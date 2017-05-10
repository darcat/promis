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

        case Enum.RectChanged:
            return Object.assign({}, state, { rect: action.payload });
        break;

        case Enum.PolyChanged:
            return Object.assign({}, state, { poly: action.payload });
        break;

        case Enum.RoundChanged:
            return Object.assign({}, state, { round: action.payload });
        break;

        case Enum.FlushTools:
            return Object.assign({}, state, {
                round: false,
                rect: false,
                poly: false,
            });
        break;

        /* ideally atomic, but requires major map rework */
        case Enum.PushGeolines:
            return Object.assign({}, state, { geolines: action.payload });
        break;

        case Enum.FlushGeolines:
            return Object.assign({}, state, { geolines: new Array() });
        break;

        default:
            return state;
        break;
    }
}
