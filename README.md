# promis-deploy
IonosatMicro PROMIS system deployment scripts and utilities

## Usage
Navigate to the source directory and type `vagrant up`. It just¹ works ™.

¹ before #17 is fixed, you also need to `git submodule update` before starting vagrant, also version specifications in the config don't work yet until vagrant starts supporting building images from git directly.

### tl;dr How do I test it quickly pls?
```BASH
git submodule init # ², on first run
git submodule update # ²
echo "development_setup: on" > conf/conf.yml
vagrant up
```
² optional if you have vagrant >= 1.8.7 and #17 is fixed

## Notes for development
### Synced folders and links
Synced folders and links persist through `vagrant down`/`vagrant up` even if you changed the config. Stop the container and remove it by docker's own means or use `vagrant destroy <container-name` to make sure you have new settings in effect if you are debugging. This also applies to inhouse containers being rebuilt because the id changes in process.

### Building containers
If you set the `build` option instead of `image` for a container, it will be built by vagrant itself. However, vagrant shall not automatically rebuild after the first build. To cause it to do so do `vagrant reload`.

### Default password
On non-Linux machines vagrant would spin a `boot2docker` virtual machine. It might ask you for credentials while syncing if for some reason the default vagrant's keypair does not work. The default password is `tcuser`.

### Ports for a VM
If run under a VM, the port mapping in case ports specified are lower than 1000 is as follows:
  - Web to 9080
  - API (if different) to 9081

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
Set `prefer_local` to `on` in `conf.yml`, then navigate to `repos/promis-*end` which are submodules and pick the respective revision manually. Try not to commit afterwards, by the way. Before #17 is fixed the option is on by default.

### Easy development setup
Override `development_setup` to `on` in `conf.yml`, it will turn SSL off, route hostnames to localhost and prefer local checkouts to git. The services will start as follows:
  - <http://localhost:8081> for Web
  - <http://localhost:8083> for API

### Generate a self-signed certificate/key pair for non-production SSL
[Use this snippet for example](http://www.codegists.com/snippet/shell/gencsr_nickgravel_shell). Run as `./genscr <hostname>`, then `<hostname>.csr` will be your certificate ad `<hostname>.key` will be your private key. Put them to `ssl/` and `conf.yml`.

### Access the DB directly
Override `expose_db` to `on` in `conf.yml`, which gives you access to the Postgres at `localhost:5432` (by default). This option is enabled automatically with `development_setup`.
