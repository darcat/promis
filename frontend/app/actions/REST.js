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
            payload: response.data.results
        });
    }).catch(function(error) {
        dispatch({
            type: Enum[name + RESTState.failed],
            payload: error.response ? error.response.status : error.request
        });
    })
}

export default {
    /* rework this */
    getSingle : function(path, params, callback) {
        return function(dispatch) {
            dispatch({
                type: RESTState.pending,
                payload: true
            });

            axios.get(path, params).then(function(response) {
                dispatch({
                    type: RESTState.completed,
                    payload: true
                });
                callback(response.data);
            }).catch(function(error) {
                dispatch({
                    type: RESTState.failed,
                    payload: true
                })
                console.log(error);
            });
        }
    },
    /* ^^^^ rework this */

    resetData : function() {
        return function(dispatch) {
            dispatch({
                type: Enum.ResetData,
                payload: true
            })
        }
    },

    getProjects : function() {
        return function(dispatch) {
            makeQuery(dispatch, 'Projects', '/en/api/projects/');
        }
    },

    getSessions : function(project, begin, end) {
        return function(dispatch) {
            makeQuery(dispatch, 'Sessions', '/en/api/sessions/', {
                params: {
                    space_project: project,
                    time_begin: begin,
                    time_end: end
                }
            });
        }
    }
}
