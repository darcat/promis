# promis-deploy
IonosatMicro PROMIS system deployment scripts and utilities

## Usage
Navigate to the source directory and type `vagrant up`. It just works ™.

## Notes for development
Synced folders persist through `vagrant down`/`vagrant up` even if you changed the config. Stop the container and remove it by docker's own means to make sure you have new settings in effect if you are debugging.
