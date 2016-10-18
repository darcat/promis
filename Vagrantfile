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

# Inspiration drawn from: http://blog.scottlowe.org/2015/02/11/multi-container-docker-yaml-vagrant/
require "yaml"

# Default options
$conf = YAML.load_file("conf/defaults.yml")

# Overrides with user-defined options
if File.file?("conf/conf.yml")
  $user_conf = YAML.load_file("conf/conf.yml")
  $user_conf.each do |override|
    $conf[override[0]] = override[1]
  end
end

# Easy to use development version
if $conf["development_setup"]
  $conf["disable_ssl"] = true unless $user_conf.key?("disable_ssl")
  $conf["servername_web"] = "localhost" unless $user_conf.key?("servername_web")
  $conf["servername_api"] = "localhost" unless $user_conf.key?("servername_api")
  $conf["port_web"] = 8081 unless $user_conf.key?("port_web")
  $conf["port_api"] = 8083 unless $user_conf.key?("port_api")
  $conf["prefer_local"] = true unless $user_conf.key?("prefer_local")
  $conf["expose_db"] = true unless $user_conf.key?("expose_db")
end

# Fix ports for oblivious people
$conf["port_web"] = 80 if $conf["port_web"] == 443 && $conf["disable_ssl"]
$conf["port_web"] = 443 if $conf["port_web"] == 80 && !$conf["disable_ssl"]
$conf["port_api"] = 80 if $conf["port_api"] == 443 && $conf["disable_ssl"]
$conf["port_api"] = 443 if $conf["port_api"] == 80 && !$conf["disable_ssl"]

# Compose port-key specifications
if $conf["disable_ssl"]
  $conf["port_key_web"] = $conf["port_web"].to_s
  $conf["port_key_api"] = $conf["port_api"].to_s
else
  $conf["port_key_web"] = $conf["port_web"].to_s + " ssl;\n" +
    "ssl_certificate " + $conf["ssl_prefix"] + "/" + $conf["ssl_cert_web"] + ";\n" +
    "ssl_certificate_key " + $conf["ssl_prefix"] + "/" + $conf["ssl_key_web"]
  $conf["port_key_api"] = $conf["port_api"].to_s + " ssl;\n" +
      "ssl_certificate " + $conf["ssl_prefix"] + "/" + $conf["ssl_cert_api"] + ";\n" +
      "ssl_certificate_key " + $conf["ssl_prefix"] + "/" + $conf["ssl_key_api"]
end

# Composing an API url
need_ext = ($conf["disable_ssl"] && $conf["port_api"] == 80) ||
  (!$conf["disable_ssl"] && $conf["port_api"] == 443)
$conf["api_url"] = ($conf["disable_ssl"] ? "http://" : "https://") +
  $conf["servername_web"] + (need_ext ? "" : ":" + $conf["port_api"].to_s)

# Container definitions
containers = YAML.load_file("conf/containers.yml")

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
          elsif !$conf["prefer_local"] && container["repo"] # Requires #17
            docker.git_repo = cfg(container["repo"])
          end
        end
        # Forward ports if necessary
        if container["ports"] && (container["name"]!=$conf["hostname_db"] || $conf["expose_db"])
          ports = container["ports"].dup
          ports.each_index do |k|
            port = cfg(ports[k])
            ports[k] = port + ":" + port
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
