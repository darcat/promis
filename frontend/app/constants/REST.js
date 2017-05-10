/* possible request states */
export const RESTState = {
    failed : 'RequestFailed',
    pending : 'RequestPending',
    completed : 'RequestCompleted',
}

/* define desired endpoints */
export const Endpoints = new Array('Devices', 'Projects', 'Sessions', 'Channels', 'Parameters', 'Measurements');

/* initial data state */
export function makeEmptyState() {
    return new Object({
        fetch: false,
        error: null,
        data: new Array()
    });
}

/* check for valid state */
export function isValidState(state) {
    return ((state === Object(state) && ! Array.isArray(state)) && Array.isArray(state.data));
}

/* check for filled (active) state */
export function isActiveState(state) {
    return (isValidState(state) && state.data.length > 0);
}

/* generate initial state using lower case endpoint names */
export const State = Endpoints.reduce(function(obj, ep) {
    obj[ep.toLowerCase()] = makeEmptyState()

    return obj;
}, new Object({
    /* non-endpoint default state fields here */
}));

/* generate types enum object from endpoints array */
export const Enum = Endpoints.reduce(function(obj, ep) {
    for(let s in RESTState) {
        let n = ep + RESTState[s];

        obj[n] = 'REST' + n;
    }

    return obj;
}, new Object({
    ResetData : 'RESTResetData'
}));

/* search array by object id */
/* can be substituted by ES2015' Array.prototype.find */
export function getById(array, id, useFirst) {
    let item  = null;
    let found = false;

    if(Array.isArray(array)) {
        array.every(function(it) {
            found = (parseInt(it.id) == parseInt(id));

            if(found) {
                item = it;
            }

            return !found;
        })

        /* allow to get first element as default */
        if(!found && useFirst) {
            item = array[0];
        }
    }

    return item;
}