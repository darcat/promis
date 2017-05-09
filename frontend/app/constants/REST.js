export const Enum = {
    RequestPending : 'RESTRequestPending',
    RequestCompleted : 'RESTRequestCompleted',
    RequestFailed : 'RESTRequestFailed',
    SetField : 'SetField'
};

export const State = {
	query: null,
	data: null,
	error: null,
    loading: false,
    geolines: new Array(),
    results: new Array()
};
