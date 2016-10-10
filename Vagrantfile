# Vagrant 1.6 required for docker
Vagrant.require_version ">= 1.6.0"

# Inspiration drawn from: http://blog.scottlowe.org/2015/02/11/multi-container-docker-yaml-vagrant/
require 'yaml'
containers = YAML.load_file('containers.yml')

Vagrant.configure("2") do |config|
  containers.each do |container|
    config.vm.define container["name"] do |node|
      # Removing the default folder sync
      node.vm.synced_folder ".", "/vagrant", disabled: true
      
      # Adding custom ones
      # TODO: make sure this doesn't proc if we've not set the config
      node.vm.synced_folder container["src"], container["dst"]
      
      # Setting docker stuff
      node.vm.provider "docker" do |docker|
        docker.image = container["image"]
        docker.ports = container["ports"]
        docker.name = container["name"]
      end
    end
  end
end
