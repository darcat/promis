import { Enum, State } from '../constants/Generic';

export default function GenericReducer(state = State, action) {
    let query = state.query;
    let altitude = state.altitude;
    let rectangle = state.rectangle;
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
        /* timelapse */
        case Enum.DateFromChanged:
            timelapse.begin = action.payload;

            return Object.assign({}, state, { timelapse : timelapse });
        break;

        case Enum.DateToChanged:
            timelapse.end = action.payload;

            return Object.assign({}, state, { timelapse : timelapse });
        break;

        /* manual polygon */
        case Enum.LatFromChanged:
            rectangle.begin[0] = action.payload;

            return Object.assign({}, state, { rectangle : rectangle });
        break;

        case Enum.LatToChanged:
            rectangle.end[0] = action.payload;

            return Object.assign({}, state, { rectangle : rectangle });
        break;

        case Enum.LngFromChanged:
            rectangle.begin[1] = action.payload;

            return Object.assign({}, state, { rectangle : rectangle });
        break;

        case Enum.LngToChanged:
            rectangle.end[1] = action.payload;

            return Object.assign({}, state, { rectangle : rectangle });
        break;

        /* altitude */
        case Enum.AltFromChanged:
            altitude.begin = action.payload;

            return Object.assign({}, state, { altitude : altitude });
        break;

        case Enum.AltToChanged:
            altitude.end = action.payload;

            return Object.assign({}, state, { altitude : altitude });
        break;

        /* channels/parameters */
        case Enum.ChannelsModeChanged:
            return Object.assign({}, state, { useChannels: action.payload });
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
