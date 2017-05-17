import { Enum, State } from '../constants/Search';

export default function SearchReducer(state = State, action) {
    switch(action.type) {
        /* timelapse */
        case Enum.DateFromChanged:
            return {
                ...state,
                timelapse: {
                    ...state.timelapse,
                    begin: action.payload
                }
            };
        break;

        case Enum.DateToChanged:
            return {
                ...state,
                timelapse: {
                    ...state.timelapse,
                    end: action.payload
                }
            };
        break;

        /* manual polygon */
        case Enum.LatFromChanged:
            return {
                ...state,
                rectangle: {
                    ...state.rectangle,
                    begin: [action.payload, state.rectangle.begin[1]]
                }
            };
        break;

        case Enum.LatToChanged:
            return {
                ...state,
                rectangle: {
                    ...state.rectangle,
                    end: [action.payload, state.rectangle.end[1]]
                }
            }
        break;

        case Enum.LngFromChanged:
            return {
                ...state,
                rectangle: {
                    ...state.rectangle,
                    begin: [state.rectangle.begin[0], action.payload]
                }
            }
        break;

        case Enum.LngToChanged:
            return {
                ...state,
                rectangle: {
                    ...state.rectangle,
                    end: [state.rectangle.end[0], action.payload]
                }
            }
        break;

        /* altitude */
        case Enum.AltFromChanged:
            return {
                ...state,
                altitude: {
                    ...state.altitude,
                    begin: action.payload
                }
            }
        break;

        case Enum.AltToChanged:
            return {
                ...state,
                altitude: {
                    ...state.altitude,
                    end: action.payload
                }
            }
        break;

        /* channels/parameters */
        case Enum.ChannelsModeChanged:
            return {
                ...state,
                useChannels: action.payload
            }
        break;

        /* query handling */
        case Enum.QueryClearData:
            return {
                ...state,
                query: {
                    ...state.query,
                    devices: new Array(),
                    channels: new Array(),
                    parameters: new Array()
                }
            }
        break;

        case Enum.QuerySetProject:
            return {
                ...state,
                query: {
                    ...state.query,
                    project: action.payload
                }
            };
        break;

        case Enum.QuerySetDevice:
            return {
                ...state,
                query: {
                    ...state.query,
                    devices: [...state.query.devices, action.payload]
                }
            };
        break;

        case Enum.QuerySetChannel:
            return {
                ...state,
                query: {
                    ...state.query,
                    channels: [...state.query.channels, action.payload]
                }
            };
        break;

        case Enum.QueryClearChannel:
            return {
                ...state,
                query: {
                    ...state.query,
                    channels: state.query.channels.filter((e) => e !== action.payload)
                }
            };
        break;

        case Enum.QuerySetParameter:
            return {
                ...state,
                query: {
                    ...state.query,
                    parameters: [...state.query.parameters, action.payload]
                }
            }
        break;

        case Enum.QueryClearParameter:
            return {
                ...state,
                query: {
                    ...state.query,
                    parameters: state.query.parameters.filter((e) => e !== action.payload)
                }
            };
        break;

        default:
            return state;
        break;
    }
}
