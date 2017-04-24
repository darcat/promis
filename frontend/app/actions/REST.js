import { Enum } from '../constants/REST';
import axios from 'axios';

export default {
    makeQuery : function(path, params, cb) {
        return function(dispatch) {
            dispatch({
                type: Enum.RequestPending,
                payload: true
            });

            axios.get( path, params ).then(function(response) {
                dispatch({
                    type: Enum.RequestCompleted,
                    payload: response.data
                });
                /*
                dispatch({
                    type: Enum.SetField,
                    payload: {
                        name: name,
                        value: response.data
                    }
                })*/
                if(cb) cb(response.data);
            }).catch(function(error) {
                dispatch({
                    type: Enum.RequestFailed,
                    payload: error.data
                })
            })
        }
    },

    setField : function(value) {
        return function(dispatch) {
            dispatch({
                type: Enum.SetField,
                payload: value
            })
        }
    }
}
