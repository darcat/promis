import { Enum, State } from '../constants/Generic';

export default function GenericReducer(state = State, action) {
    let query = state.query;
    let altitude = state.altitude;
    let timelapse = state.timelapse;

    if(! Array.isArray(query.channels)) {
        query.channels = new Array();
    }

    if(! Array.isArray(query.parameters)) {
        query.parameters = new Array();
    }

    if(! Array.isArray(query.devices)) {
        query.devices = new Array();
    }

    switch(action.type) {
        case Enum.SelectionModeChanged:
            return Object.assign({}, state, { useMap: action.payload });
        break;

        /* timelapse handling */
        case Enum.DateFromChanged:
            timelapse.begin = action.payload;

            return Object.assign({}, state, { timelapse : timelapse });
        break;

        case Enum.DateToChanged:
            timelapse.end = action.payload;

            return Object.assign({}, state, { timelapse : timelapse });
        break;

        case Enum.LatFromChanged:
            return Object.assign({}, state, { latFrom: action.payload });
        break;

        case Enum.LatToChanged:
            return Object.assign({}, state, { latTo: action.payload });
        break;

        case Enum.LngFromChanged:
            return Object.assign({}, state, { lngFrom: action.payload });
        break;

        case Enum.LngToChanged:
            return Object.assign({}, state, { lngTo: action.payload });
        break;

        /* altitude handling */
        case Enum.AltFromChanged:
            altitude.begin = action.payload;

            return Object.assign({}, state, { altitude : altitude });
        break;

        case Enum.AltToChanged:
            altitude.end = action.payload;

            return Object.assign({}, state, { altitude : altitude });
        break;


        /* query handling */
        case Enum.QuerySetProject:
            query.project = action.payload;

            return Object.assign({}, state, {
                query: query
            });
        break;

        case Enum.QuerySetDevice:
            query.devices.push(action.payload);

            return Object.assign({}, state, {
                query: query
            });
        break;

        case Enum.QuerySetChannel:
            query.channels.push(action.payload);

            return Object.assign({}, state, {
                query: query
            });
        break;

        case Enum.QueryClearChannel:
            query.channels = query.channels.filter(function(e) { return e !== action.payload });

            return Object.assign({}, state, {
                query: query
            });
        break;

        case Enum.QuerySetParameter:
            query.parameters.push(action.payload);

            return Object.assign({}, state, {
                query: query
            });
        break;

        case Enum.QueryClearParameter:
            query.parameters = query.parameters.filter(function(e) { return e !== action.payload });

            return Object.assign({}, state, {
                query: query
            });
        break;

        default:
            return state;
        break;
    }
}
