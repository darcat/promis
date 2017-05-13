import { Enum, State } from '../constants/Generic';

export default function GenericReducer(state = State, action) {
    let query = state.query;

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
            return Object.assign({}, state, { mapEnabled: action.payload });
        break;

        case Enum.DateFromChanged:
            return Object.assign({}, state, { dateFrom: action.payload });
        break;

        case Enum.DateToChanged:
            return Object.assign({}, state, { dateTo: action.payload });
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

        case Enum.AltFromChanged:
            return Object.assign({}, state, { altFrom: action.payload });
        break;

        case Enum.AltToChanged:
            return Object.assign({}, state, { altTo: action.payload });
        break;



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
            query.channels = query.channels.filter(function(e) { return e !== action.payload })

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
            query.parameters = query.parameters.filter(function(e) { return e !== action.payload })

            return Object.assign({}, state, {
                query: query
            });
        break;

        default:
            return state;
        break;
    }
}
