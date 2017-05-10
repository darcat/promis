import { Enum, Endpoints, State, RESTState, makeEmptyState } from '../constants/REST';

/* wrap single endpoint operation into one reducer */
function genericReducer(name, state, action) {
    let obj = name.toLowerCase();

    switch(action.type) {
        case Enum[String(name + RESTState.pending)]:
            return Object.assign({}, state, { [obj] : { fetch: true } });
        break;

        case Enum[String(name + RESTState.completed)]:
            return Object.assign({}, state, { [obj] : { fetch: false, data: action.payload, error: null } });
        break;

        case Enum[String(name + RESTState.failed)]:
            return Object.assign({}, state, { [obj] : { fetch: false, data: null, error: action.payload } });
        break;

        default:
            return null;
        break;
    }
}

export default function RESTReducer(state = State, action) {
    let newState = null;

    /* endpoint handling */
    Endpoints.forEach(function(endpoint) {
        let reduced = genericReducer(endpoint, state, action);

        if(reduced !== null) newState = reduced;
    });

    /* action not related to endpoints */
    if(! newState) {
        switch(action.type) {
            case Enum.ResetData:
                newState = Object.assign({}, state, {
                    sessions : makeEmptyState(),
                    channels : makeEmptyState(),
                    parameters : makeEmptyState(),
                    measurements : makeEmptyState()
                });
            break;

            case Enum.PushMeasurement:
                let meas = state.measurements;

                if(Array.isArray(meas.data)) {
                    meas.data.push(action.payload);
                }

                newState = Object.assign({}, state, { measurements : meas });
            break;
        }
    }

    return newState || state;
}
