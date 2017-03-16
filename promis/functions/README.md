## Defining functions

Every function from `functions.` package with a docstring will be recorded into the database. Docstrings are parsed for the `[lang]:` tags which define translations. If the parser fails to find any, the function is not recorded. Language codes are 2 letter, lowercase.

## Syntax reference

### Checking for updates

`def check(satellite_object)`

Yields successive data identifiers.

### Fetch and import an update

`def fetch(satellite_object, data_identifier)`
