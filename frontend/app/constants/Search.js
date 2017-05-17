export const Enum = {
    DateFromChanged : 'SearchDateStartChanged',
    DateToChanged : 'SearchDateFinishChanged',
    LatFromChanged : 'SearchLatStartChanged',
    LatToChanged : 'SearchLatFinishChanged',
    LngFromChanged : 'SearchLngFStartChanged',
    LngToChanged : 'SearchLngFinishChanged',
    AltFromChanged : 'SearchAltFromChanged',
    AltToChanged : 'SearchAltToChanged',
    ChannelsModeChanged : 'SearchChannelsModeChanged',

    QueryClearData : 'SearchQueryClearData',
    QuerySetProject : 'SearchSetProject',
    QuerySetDevice : 'SearchSetDevice',
    QuerySetChannel : 'SearchSetChannel',
    QueryClearChannel : 'SearchClearChannel',
    QuerySetParameter : 'SearchSetParameter',
    QueryClearParameter : 'SearchClearParameter'
};

export const State = {
    /* map or manual input */
    useMap : false,

    /* query: channels or parameters */
    useChannels : false,

    /* manual input bounds (LatLng format) */
    rectangle : {
        begin : new Array(-90.0, -180.0),
        end : new Array(90.0, 180.0)
    },

    /* altitude */
    altitude : {
        begin: 0,
        end: 800
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
