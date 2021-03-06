#
# Copyright 2016 Space Research Institute of NASU and SSAU (Ukraine)
#
# Licensed under the EUPL, Version 1.1 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
#
# https://joinup.ec.europa.eu/software/page/eupl
#
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
#

# Vagrant 1.8 required for docker and no parallel setting
Vagrant.require_version ">= 1.8.0"

# Prevent parallel setup, we need this for links
ENV["VAGRANT_NO_PARALLEL"] = "yes"

# Enforce default docker provider, for some reason defaults
# to VirtualBox on some Gentoo setups despite configuration
ENV["VAGRANT_DEFAULT_PROVIDER"] = "docker"

vagrant_root = File.dirname(__FILE__)

load File.join(vagrant_root, "config.rb")

# Composing the API url
need_ext = ($conf["disable_ssl"] && $conf["port_web"] == 80) ||
  (!$conf["disable_ssl"] && $conf["port_web"] == 443)
$conf["promis_origin"] = $conf["servername_web"] + (need_ext ? "" : ":" + $conf["port_web"].to_s)

# Container definitions
containers = YAML.load_file(File.join(vagrant_root, "conf", "containers.yml"))

# Check if input contains a configuration variable reference, if so, substitute
# TODO: better approach
def cfg(input)
  res = input.dup
  rexp_conf = /\${conf.([a-zA-Z_][a-zA-Z0-9_]*)}/
  while res.match(rexp_conf)
    res[rexp_conf] = $conf[res[rexp_conf, 1]].to_s
  end
  return res
end

# Process auto-generated files
# NOTE: this ALWAYS runs even on vagrant-status etc
generated = YAML.load_file(File.join(vagrant_root, "conf", "/generated.yml"))
generated.each do | ifname, odirs |
    s = cfg(IO.read(File.join(vagrant_root, ifname)))
    bname = File.basename ifname
    odirs.each do | odir |
        fp = File.open(File.join(vagrant_root, odir, bname), "w")
        fp.puts s
        fp.close
    end
end

Vagrant.configure("2") do |config|
  config.vm.provider "docker"
  containers.each do |container|
    config.vm.define cfg(container["name"]), autostart: ! container["noauto"] do |node|
      # Removing the default folder sync
      node.vm.synced_folder ".", "/vagrant", disabled: true

      # Adding custom ones
      if container["sync"]
        container["sync"].each do |sync|
          node.vm.synced_folder cfg(sync[0]), cfg(sync[1])
        end
      end
      
      # Code reload directories
      if $conf["code_reload"] and container["reload"]
        container["reload"].each do |sync|
          node.vm.synced_folder cfg(sync[0]), cfg(sync[1])
        end
      end

      # Setting docker stuff
      node.vm.provider "docker" do |docker|
        # Not sure we need to set it for every container, but no harm
        if $conf["force_host_vm"]
          docker.force_host_vm = true
        end
        # This can be set outside of the block above by vagrant itself
        if docker.force_host_vm
          docker.vagrant_vagrantfile = "Vagrantfile.hostvm"
        end
        # Pick up whether we need to build or reuse an image
        if container["image"]
          docker.image = cfg(container["image"])
        elsif
          docker.build_dir = cfg(container["build"])
        end
        # Forward ports if necessary
        if container["ports"] && (cfg(container["name"])!=$conf["hostname_db"] || $conf["expose_db"])
          ports = container["ports"].dup
          ports.each_index do |k|
            port = cfg(ports[k])
            if ! port.include? ":"
              ports[k] = port + ":" + port
            else
              ports[k] = port
            end
          end
          docker.ports = ports
        end
        # Link other containers
        if container["depend"]
          container["depend"].each do |link|
            linkhost = cfg(link)
            docker.link(linkhost + ":" + linkhost)
          end
        end
        # Set up environment vars
        if container["env"]
          container["env"].each do |env|
            docker.env[env[0]] = cfg(env[1])
          end
        end
        docker.name = cfg(container["name"])
      end
    end
  end
end
