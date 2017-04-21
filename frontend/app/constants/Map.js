var Enum = {
	ZoomChanged : 'MapZoomChanged',
	SizeChanged : 'MapSizeChanged',
    DimsChanged : 'MapDimsChanged',
	ModeChanged : 'MapModeChanged',
	GridChanged : 'MapGridToggled',
	SelectionUpdated: 'MapSelectionUpdated'
};

var State = {
    zoom: 5,
    flat: true,
    full: false,
    dims: [300, 300],
    grid: false,
    geolines: [],
    selection: []
};

module.exports = { Enum, State };