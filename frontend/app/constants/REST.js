/* possible request states */
export const RESTState = {
    failed : 'RequestFailed',
    pending : 'RequestPending',
    completed : 'RequestCompleted',
}

/* define desired endpoints */
export const Endpoints = new Array('Devices', 'Projects', 'Sessions', 'Channels', 'Parameters', 'Measurements');

/* generate initial state using lower case endpoint names */
export const State = Endpoints.reduce(function(obj, ep) {
    obj[ep.toLowerCase()] = new Object({
        fetch: false,
        error: null,
        data: null
    });

    return obj;
}, new Object({}));

/* generate types enum object from endpoints array */
export const Enum = Endpoints.reduce(function(obj, ep) {
    for(let s in RESTState) {
        let n = ep + RESTState[s];

        obj[n] = 'REST' + n;
    }

    return obj;
}, new Object({}));
