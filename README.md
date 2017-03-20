# promis-setup
IonosatMicro PROMIS system integrated test setup environment

## Utility commands

`./sql_access_docker`

Runs a Postgres container that connects to the database and drops into the Postgres prompt. Can accept pipes and redirections to take SQL input. Must be run on a docker host obviously.

`./sql_access_psql`

Runs psql and connects to the database. Host machine must have Postgres installed and `expose_db` option must be on. Currently only uses the default port.

`./api_shell`

Runs the Django shell in the backend container.

`./api_bash`

Runs BASH in the backend container.

`./api_command <command>`

Runs the Django command `<command>` in the backend container.

## How to insert test data?

`./repos/promis-testing/api_command loaddata --format json - < repos/promis-testing/data/test_set.json`

This does the job.
