export const Enum = {
    DateFromChanged : 'GenericDateStartChanged',
    DateToChanged : 'GenericDateFinishChanged',
    LatFromChanged : 'GenericLatStartChanged',
    LatToChanged : 'GenericLatFinishChanged',
    LngFromChanged : 'GenericLngFStartChanged',
    LngToChanged : 'GenericLngFinishChanged',
    AltFromChanged : 'GenericAltFromChanged',
    AltToChanged : 'GenericAltToChanged',
    ChannelsModeChanged : 'GenericChannelsModeChanged',

    QuerySetProject : 'GenericSetProject',
    QuerySetDevice : 'GenericSetDevice',
    QuerySetChannel : 'GenericSetChannel',
    QueryClearChannel : 'GenericClearChannel',
    QuerySetParameter : 'GenericSetParameter',
    QueryClearParameter : 'GenericClearParameter'
};

export const State = {
    /* query: channels or parameters */
    useChannels : false,

    /* manual input bounds (LatLng format) */
    rectangle : {
        begin : new Array(-90.0, -180),
        end : new Array(90.0, 180)
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
