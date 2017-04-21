var Map = require('../constants/Map');
var Enum = Map.Enum;

module.exports = {
    toggleZoom : function(zoom) {
        return function(dispatch) {
            dispatch({
                type: Enum.ZoomChanged,
                payload: zoom
            })
        }
    },

    toggleFullscreen : function(fullscreen) {
        return function(dispatch) {
            dispatch({
                type: Enum.SizeChanged,
                payload: fullscreen
            })
        }
    },

    toggleDims : function(newDimensions) {
        return function(dispatch) {
            dispatch({
                type: Enum.DimsChanged,
                payload: newDimensions
            })
        }
    },

    toggleFlat : function(flatMode) {
        return function(dispatch) {
            dispatch({
                type: Enum.ModeChanged,
                payload: flatMode
            })
        }
    },

    toggleGrid : function(newGrid) {
        return function(dispatch) {
            dispatch({
                type: Enum.GridChanged,
                payload: newGrid
            })
        }
    }
}
