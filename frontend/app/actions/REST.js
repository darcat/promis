import { Enum, RESTState } from '../constants/REST';
import axios from 'axios';

function makeQuery(dispatch, name, path, params) {
    dispatch({
        type: Enum[name + RESTState.pending],
        payload: true
    });

    axios.get(path, params).then(function(response) {
        dispatch({
            type: Enum[name + RESTState.completed],
            payload: response.data
        });
    }).catch(function(error) {
        dispatch({
            type: Enum[name + RESTState.failed],
            payload: error.response ? error.response.status : error.request
        });
    })
}

export default {
    getProjects : function() {
        return function(dispatch) {
            makeQuery(dispatch, 'Projects', '/en/api/projects/');
        }
    },
}
