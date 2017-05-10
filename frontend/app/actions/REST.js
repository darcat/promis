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
    },

    /* disabled until proper backend filter */
    /*
    getMeasurements : function() {
        return function(dispatch) {
            makeQuery(dispatch, 'Measurements', '/en/api/measurements', {
                params: {

                }
            });
        }
    }*/

    getMeasurements : function(sessions, params) {
        return function(dispatch) {
            dispatch({
                type: Enum['Measurements' + RESTState.pending],
                payload: true
            });

            let promises = new Array();
            let measurements = new Array();

            sessions.forEach(function(session) {
                params.forEach(function(param) {
                    promises.push(axios.get('/en/api/measurements', {
                        params: {
                            /* warn: needs proper backend filter */
                            channel: param,
                            session: session.id,
                            parameter: param
                        }
                    }));
                })
            });

            axios.all(promises).then(axios.spread(function(...responses) {
                responses.forEach(function(response) {
                    if(Array.isArray(response.data.results) && response.data.results.length > 0) {
                        /*dispatch({
                            type: Enum.PushMeasurement,
                            payload: response.data.results[0].id
                        })*/
                        measurements.push(response.data.results[0].id);
                    }
                });
            })).then(function(){
                dispatch({
                    type: Enum['Measurements' + RESTState.completed],
                    payload: measurements
                });

            });
        }
    }
}
