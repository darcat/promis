export const Enum = {
    DateFromChanged : 'SearchDateStartChanged',
    DateToChanged : 'SearchDateFinishChanged',
    LatFromChanged : 'SearchLatStartChanged',
    LatToChanged : 'SearchLatFinishChanged',
    LngFromChanged : 'SearchLngFStartChanged',
    LngToChanged : 'SearchLngFinishChanged',
    AltFromChanged : 'SearchAltFromChanged',
    AltToChanged : 'SearchAltToChanged',
    SelectionModeChanged : 'SearchSelectionModeChanged',
    ChannelsModeChanged : 'SearchChannelsModeChanged',

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
        begin : new Array(41.33, 42.11),
        end : new Array(14.22, 17.31)
    },

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
