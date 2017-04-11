# Defining functions

Every function from `functions.` package with a docstring will be recorded into the database. Docstrings are parsed for the `[lang]:` tags which define translations. If the parser fails to find any, the function is not recorded. Language codes are 2 letter, lowercase.

# Syntax reference

## Data collection

`def data_func(satellite_object)`

Returns 2 functions below. Satellite reference stored as a closure.

### Checking for updates

`def check()`

Yields successive data identifiers.

### Fetch and import an update

`def fetch(data_identifier)`

## Quick-look

`def quicklook(doc, ...)`

Convert Python native object doc to a quicklook representation. The callee will expand the request parameters into keyword arguments.

## Export

`def export(doc, session, fmt)`

Convert the document doc to the output format. The function is expected to yield lines of output or chunks of data.

TODO: is format a string or something else? Currently the former
