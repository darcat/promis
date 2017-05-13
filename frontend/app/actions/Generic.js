import { Enum } from '../constants/Generic';

export default {
    mapToggled : function(newMode) {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionModeChanged,
                payload: newMode
            })
        }
    },

    dateFromInput : function(value) {
        return function(dispatch) {
            dispatch({
                type: Enum.DateFromChanged,
                payload: value
            })
        }
    },

    dateToInput : function(value) {
        return function(dispatch) {
            dispatch({
                type: Enum.DateToChanged,
                payload: value
            })
        }
    },

    latFromInput : function(value) {
        return function(dispatch) {
            dispatch({
                type: Enum.LatFromChanged,
                payload: value
            })
        }
    },

    latToInput : function(value) {
        return function(dispatch) {
            dispatch({
                type: Enum.LatToChanged,
                payload: value
            })
        }
    },

    lngFromInput : function(value) {
        return function(dispatch) {
            dispatch({
                type: Enum.LngFromChanged,
                payload: value
            })
        }
    },

    lngToInput : function(value) {
        return function(dispatch) {
            dispatch({
                type: Enum.LngToChanged,
                payload: value
            })
        }
    },

    altFromInput : function(value) {
        return function(dispatch) {
            dispatch({
                type: Enum.AltFromChanged,
                payload: value
            })
        }
    },

    altToInput : function(value) {
        return function(dispatch) {
            dispatch({
                type: Enum.AltToChanged,
                payload: value
            })
        }
    },

    setProject : function(proj) {
        return function(dispatch) {
            dispatch({
                type: Enum.QuerySetProject,
                payload: proj
            })
        }
    },

    setDevice : function(dev) {
        return function(dispatch) {
            dispatch({
                type: Enum.QuerySetDevice,
                payload: dev
            })
        }
    },

    setChannel : function(ch) {
        return function(dispatch) {
            dispatch({
                type: Enum.QuerySetChannel,
                payload: ch
            })
        }
    },

    setParameter : function(param) {
        return function(dispatch) {
            dispatch({
                type: Enum.QuerySetParameter,
                payload: param
            })
        }
    },

};
