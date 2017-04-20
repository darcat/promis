var Enum = {
    DateFromChanged : 'GenericDateStartChanged',
    DateToChanged : 'GenericDateFinishChanged',
    LatFromChanged : 'GenericLatStartChanged',
    LatToChanged : 'GenericLatFinishChanged',
    LngFromChanged : 'GenericLngFStartChanged',
    LngToChanged : 'GenericLngFinishChanged',
    AltFromChanged : 'GenericAltFromChanged',
    AltToChanged : 'GenericAltToChanged',
    SelectionModeChanged : 'GenericSelectionModeChanged'
};

var State = {
    dateFrom : '',
    dateTo : '',
    latFrom : 41.33,
    latTo : 42.11,
    lngFrom : 14.22,
    lngTo : 17.31,
    altFrom : 0,
    altTo : 100,
    mapEnabled : false
};

module.exports = { Enum, State };