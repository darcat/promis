import { Enum, State } from '../constants/REST';

export default function RESTReducer(state = State, action) {
    switch(action.type) {
        case Enum.RequestPending:
            return Object.assign({}, state, { loading : true });
        break;

        case Enum.RequestCompleted:
            return Object.assign({}, state, { loading : false, data : action.payload });
        break;

        case Enum.RequestFailed:
            return Object.assign({}, state, { loading : false, error: action.payload });
        break;

        case Enum.SetField:
            var updated = state.data;

            updated[action.payload.name] = action.payload.value;

            return Object.assign({}, state, { data: updated });
        break;
    }

    return state;
}
