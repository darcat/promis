import { Enum } from '../constants/REST';

export default {
    stub : function() {
        return function(dispatch) {
            dispatch({
                type: Enum.RequestCompleted,
                payload: true
            })
        }
    },
}
