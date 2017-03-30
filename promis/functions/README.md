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
