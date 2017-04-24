import { Enum, State } from '../constants/REST';

export default function RESTReducer(state = State, action) {
    switch(action.type) {
        case Enum.RequestPending:
            return Object.assign({}, state, { loading : true });
        break;

        case Enum.RequestCompleted:
            return Object.assign({}, state, { data : action.payload });
        break;

        case Enum.RequestFailed:
            return Object.assign({}, state, { error: action.payload });
        break;
    }

    return state;
}
