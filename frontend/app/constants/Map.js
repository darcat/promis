export const Enum = {
    ZoomChanged      : 'MapZoomChanged',
    SizeChanged      : 'MapSizeChanged',
    DimsChanged      : 'MapDimsChanged',
    ModeChanged      : 'MapModeChanged',
    GridChanged      : 'MapGridToggled',
    RectChanged      : 'MapRectToggled',
    PolyChanged      : 'MapPolyChanged',
    RoundChanged     : 'MapRoundChanged',
    FlushTools       : 'MapFlushTools',
    PushGeoline      : 'MapPushGeoline',
    FlushGeolines    : 'MapFlushGeolines',
    SelectionUpdated : 'MapSelectionUpdated'
};

export const State = {
    zoom: 5,               /* zoom level */
    flat: true,            /* true for 2D, false for 3D */
    full: false,           /* fullscreen mode */
    grid: false,           /* grid status */
    rect: false,           /* rectangular selection tool status */
    poly: false,           /* polygon selection tool status */
    round: false,          /* circular selection tool status */
    dims: [300, 300],      /* map fullscreen dimensions */
    geolines: new Array()  /* geolines to draw */
};

export const BingKey = 'AjsNBiX5Ely8chb5gH7nh6HLTjlQGVKOg2A6NLMZ30UhprYhSkg735u3YUkGFipk';
