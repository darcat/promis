import { Enum, Endpoints, State, RESTState } from '../constants/REST';

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
            console.log('got error', obj)
            return Object.assign({}, state, { [obj] : { fetch: false, data: null, error: action.payload } });
        break;

        default:
            return null;
        break;
    }
}

export default function RESTReducer(state = State, action) {
    console.log(action);

    let newState = null;

    Endpoints.forEach(function(endpoint) {
        let reduced = genericReducer(endpoint, state, action);

        if(reduced !== null) newState = reduced;
    });

    return newState || state;
}
