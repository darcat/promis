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

vagrant_root = File.dirname(__FILE__) + "/"

load vagrant_root + "config.rb"

# The docker build from git will hopefully be included in Vagrant 1.8.7
# TODO: bump this to 1.8.7 from 1.8.7.dev after it goes to release
if !$conf["prefer_local"]
  Vagrant.require_version ">= 1.8.7.dev"
end

# Container definitions
containers = YAML.load_file(vagrant_root + "conf/containers.yml")

# Check if input contains a configuration variable reference, if so, substitute
def cfg(input)
  res = input.dup
  rexp_conf = /\${conf.([a-zA-Z_][a-zA-Z0-9_]*)}/
  while res.match(rexp_conf)
    res[rexp_conf] = $conf[res[rexp_conf, 1]].to_s
  end
  return res
end

Vagrant.configure("2") do |config|
  config.vm.provider "docker"
  containers.each do |container|
    config.vm.define cfg(container["name"]) do |node|
      # Removing the default folder sync
      node.vm.synced_folder ".", "/vagrant", disabled: true

      # Adding custom ones
      if container["sync"]
        container["sync"].each do |sync|
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
          if $conf["prefer_local"] && container["build"]
            docker.build_dir = cfg(container["build"])
          elsif !$conf["prefer_local"] && container["git_repo"]
            docker.git_repo = cfg(container["git_repo"])
          end
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
