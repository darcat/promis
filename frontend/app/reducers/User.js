import { Enum, State } from '../constants/User';

export default function UserReducer(state = State, action) {
    switch(action.type) {
        case Enum.LoginRequest:
        case Enum.ProfileRequest:
        case Enum.RegisterRequest:
            return Object.assign({}, state, {
                loading : true,
            });
        break;

        case Enum.ProfileSuccess:
            return Object.assign({}, state, {
                user: {
                    id : action.payload.id,
                    name : action.payload.name
                }
            });
        break;

        case Enum.LoginSuccess:
        case Enum.RegisterSuccess:
            return Object.assign({}, state, { loading : false, success: true });
        break;

        case Enum.LoginFailed:
        case Enum.ProfileFailed:
        case Enum.RegisterFailed:
            return Object.assign({}, state, {
                user : false,
                loading : false,
                success : false,
                detail: action.payload
            });
        break;
    }

    return state;
}
