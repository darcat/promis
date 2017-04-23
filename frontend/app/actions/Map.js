import { Enum } from '../constants/Map';

export default {
    changeZoom : function(newZoom) {
        return function(dispatch) {
            dispatch({
                type: Enum.ZoomChanged,
                payload: newZoom
            })
        }
    },

    toggleFullscreen : function(fullscreenStatus) {
        return function(dispatch) {
            dispatch({
                type: Enum.SizeChanged,
                payload: fullscreenStatus
            })
        }
    },

    toggleDims : function(newDimensions) {
        return function(dispatch) {
            dispatch({
                type: Enum.DimsChanged,
                payload: {
                    width: newDimensions.width,
                    height: newDimensions.height
                }
            })
        }
    },

    toggleFlat : function(newFlatMode) {
        return function(dispatch) {
            dispatch({
                type: Enum.ModeChanged,
                payload: newFlatMode
            })
        }
    },

    toggleGrid : function(newGridState) {
        return function(dispatch) {
            dispatch({
                type: Enum.GridChanged,
                payload: newGridState
            })
        }
    },

    toggleRect : function(newRectState) {
        return function(dispatch) {
            dispatch({
                type: Enum.RectChanged,
                payload: newRectState
            })
        }
    },

    togglePoly : function(newPolyState) {
        return function(dispatch) {
            dispatch({
                type: Enum.PolyChanged,
                payload: newPolyState
            })
        }
    },

    toggleRound : function(newRoundState) {
        return function(dispatch) {
            dispatch({
                type: Enum.RoundChanged,
                payload: newRoundState
            })
        }
    }
};
