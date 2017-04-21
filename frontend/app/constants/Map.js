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

var BingKey = 'AjsNBiX5Ely8chb5gH7nh6HLTjlQGVKOg2A6NLMZ30UhprYhSkg735u3YUkGFipk';

module.exports = { Enum, State, BingKey };