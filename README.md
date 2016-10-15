# promis-deploy
IonosatMicro PROMIS system deployment scripts and utilities

## Usage
Navigate to the source directory and type `vagrant up`. It just¹ works ™.

¹ before #17 is fixed, you also need to `git submodule update` before starting vagrant, also version specifications in the config don't work yet until vagrant starts supporting building images from git directly.

## Notes for development
### Synced folders and links
Synced folders and links persist through `vagrant down`/`vagrant up` even if you changed the config. Stop the container and remove it by docker's own means or use `vagrant destroy <container-name` to make sure you have new settings in effect if you are debugging. This also applies to inhouse containers being rebuilt because the id changes in process.

### Building containers
If you set the `build` option instead of `image` for a container, it will be built by vagrant itself. However, vagrant shall not automatically rebuild after the first build. To cause it to do so do `vagrant reload`.

### Default password
On non-Linux machines vagrant would spin a `boot2docker` virtual machine. It might ask you for credentials while syncing if for some reason the default vagrant's keypair does not work. The default password is `tcuser`.

### Ports for a VM
If run under a VM, the port mapping to the host is as follows:
  - 8080 to 8080
  - 80 to 8081
  - 443 to 8082

### Force operation in a VM
Set `force_host_vm` to `true` or `on` in `conf/conf.yml`.

### Pre 1.8 vagrant
There might be parallel build issues if you are using old vagrant. Try `vagrant up --no-parallel`, but really upgrade. 1.7 is quite buggy.

### Configuration options
Copy `conf/defaults.yml` as `conf/conf.yml` and edit the values. You can only leave the options you want to override, the rest will be taken from defaults. You can reference `conf.var_name` in `containers.yml`.

### Custom nginx sites
Put your `*.conf` files in `nginx/`. They will not be picked up by Git because of `.gitignore`.

### Where to put SSL certificates
Everything that goes in `ssl/` folder is mapped to `/etc/ssl.d/` on the nginx container.

### Specify which versions to deploy
Before #17 is fixed, navigate to `repos/promis-*end` which are submodules and pick the respective revision manually. Try not to commit afterwards, by the way.
