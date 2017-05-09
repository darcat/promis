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

    setType : function(selType) {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionSetType,
                payload: selType
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

    discardSelection : function() {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionCancel,
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

    removeFromSelection : function(goodbyeIndex, rootIndex) {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionDeleteElement,
                payload: {
                    root: rootIndex,
                    index: goodbyeIndex
                }
            })
        }
    },

    editSelection : function(elementIndex, newValue, rootIndex) {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionEditElement,
                payload: {
                    root: rootIndex,
                    index: elementIndex,
                    value: newValue
                }
            })
        }
    },

    clearSelection : function(index) {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionPurge,
                payload: (index !== undefined ? index : null)
            })
        }
    },

    highlightSelection : function(index) {
        return function(dispatch) {
            dispatch({
                type: Enum.SelectionHighlight,
                payload: (index !== undefined ? index : null)
            })
        }
    }

};
