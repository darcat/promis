import { Enum } from '../constants/Selection';

export default {
    startSelection : function() {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionOpened,
                payload: true
            })
        }
    },

    finishSelection : function() {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionClosed,
                payload: true
            })
        }
    },

    addToSelection : function(newPoint) {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionPushElement,
                payload: newPoint
            })
        }
    },

    removeFromSelection : function(goodbyeIndex) {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionDeleteElement,
                payload: goodbyeIndex
            })
        }
    },

    editSelection : function(index, newValue) {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionEditElement,
                payload: {
                    index: index,
                    value: newValue
                }
            })
        }
    },

    clearSelection : function() {
        return function(dispatch) {
            dispatch({
                type: Enum.selectionPurge,
                payload: true
            })
        }
    }

};
