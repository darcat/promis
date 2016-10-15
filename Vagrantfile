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
ENV['VAGRANT_NO_PARALLEL'] = 'yes'

# Enforce default docker provider, for some reason defaults
# to VirtualBox on some Gentoo setups despite configuration
ENV['VAGRANT_DEFAULT_PROVIDER'] = 'docker'

# Inspiration drawn from: http://blog.scottlowe.org/2015/02/11/multi-container-docker-yaml-vagrant/
require 'yaml'

# Default options
$conf = YAML.load_file('conf/defaults.yml')

# Overrides with user-defined options
if File.file?('conf/conf.yml')
  YAML.load_file('conf/conf.yml').each do |override|
    $conf[override[0]] = override[1]
  end
end

# Container definitions
containers = YAML.load_file('conf/containers.yml')

# Check if input contains a configuration variable reference, if so, substitute
def cfg(input)
  res = input
  rexp_conf = /\${conf.([a-zA-Z_][a-zA-Z0-9_]*)}/
  while res.match(rexp_conf)
    res[rexp_conf] = $conf[res[rexp_conf, 1]]
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
          node.vm.synced_folder sync[0], sync[1]
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
        elsif container["build"]
          docker.build_dir = cfg(container["build"])
      #  elsif container["repo"] # Requires #17
      #    docker.git_repo = cfg(container["repo"])
        end
        # Forward ports if necessary
        if container["ports"]
          docker.ports = container["ports"]
        end
        # Link other containers
        if container["link"]
          container["link"].each do |link|
            docker.link(cfg(link))
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
