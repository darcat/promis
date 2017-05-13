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


    SetProject : 'GenericSetProject'
};

export const State = {
    mapEnabled : false,
    dateFrom : 0,
    dateTo : 0,
    latFrom : 41.33,
    latTo : 42.11,
    lngFrom : 14.22,
    lngTo : 17.31,
    altFrom : 0,
    altTo : 100,
    project : 0,

    /* new structure, to be refactored */
    timelapse: {
        begin: 0,
        end: 0,
    },
    fields : {  /* search fields, can be arrays */
        project: 0,
        device: 0,
        channel: 0,
        parameter: 0,
    }
};
