import { Enum } from '../constants/Search';

export default {
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

    toggleChannels : function(ch) {
        return function(dispatch) {
            dispatch({
                type: Enum.ChannelsModeChanged,
                payload: ch
            })
        }
    },

    clearQuery : function() {
        return function(dispatch) {
            dispatch({
                type: Enum.QueryClearData,
                payload: true
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

    clearChannel : function(ch) {
        return function(dispatch) {
            dispatch({
                type: Enum.QueryClearChannel,
                payload: ch
            })
        }
    },

    clearParameter : function(p) {
        return function(dispatch) {
            dispatch({
                type: Enum.QueryClearParameter,
                payload: p
            })
        }
    }
};
