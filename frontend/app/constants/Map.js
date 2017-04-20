var Enum = {
	ZoomChanged : 'MapZoomChanged',
	SizeChanged : 'MapSizeChanged',
	ModeChanged : 'MapModeChanged',
	GridChanged : 'MapGridToggled',
	SelectionUpdated: 'MapSelectionUpdated'
};

var State = {
    zoom: 5,
    flat: true,
    full: false,
    grid: false,
    geolines: [],
    selection: []
};

module.exports = { Enum, State };