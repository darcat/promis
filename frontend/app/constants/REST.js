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

/* search array by object id */
/* can be substituted by ES2015' Array.prototype.find */
export function getById(array, id) {
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
    }

    return item;
}