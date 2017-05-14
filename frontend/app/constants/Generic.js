export const Enum = {
    DateFromChanged : 'GenericDateStartChanged',
    DateToChanged : 'GenericDateFinishChanged',
    LatFromChanged : 'GenericLatStartChanged',
    LatToChanged : 'GenericLatFinishChanged',
    LngFromChanged : 'GenericLngFStartChanged',
    LngToChanged : 'GenericLngFinishChanged',
    AltFromChanged : 'GenericAltFromChanged',
    AltToChanged : 'GenericAltToChanged',
    SelectionModeChanged : 'GenericSelectionModeChanged',


    QuerySetProject : 'GenericSetProject',
    QuerySetDevice : 'GenericSetDevice',
    QuerySetChannel : 'GenericSetChannel',
    QueryClearChannel : 'GenericClearChannel',
    QuerySetParameter : 'GenericSetParameter',
    QueryClearParameter : 'GenericClearParameter'
};

export const State = {
    useMap : false,
    latFrom : 41.33,
    latTo : 42.11,
    lngFrom : 14.22,
    lngTo : 17.31,

    /* altitude */
    altitude : {
        begin: 0,
        end: 100
    },

    /* data interval */
    timelapse: {
        begin: 0,
        end: 0,
    },

    /* API-related search fields (ids), can be arrays */
    query : {
        project:    0,
        devices:    new Array(),
        channels:   new Array(),
        parameters: new Array(),
    }
};
