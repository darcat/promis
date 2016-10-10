# Vagrant 1.6 required for docker
Vagrant.require_version ">= 1.6.0"

# Prevent parallel setup, we need this for links
ENV['VAGRANT_NO_PARALLEL'] = 'yes'

# Inspiration drawn from: http://blog.scottlowe.org/2015/02/11/multi-container-docker-yaml-vagrant/
require 'yaml'
containers = YAML.load_file('containers.yml')

Vagrant.configure("2") do |config|
  containers.each do |container|
    config.vm.define container["name"] do |node|
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
        # Pick up whether we need to build or reuse an image
        if container["image"]
          docker.image = container["image"]
        elsif container["build"]
          docker.build_dir = container["build"]
        end
        # Forward ports if necessary
        if container["ports"]
          docker.ports = container["ports"]
        end
        # Link other containers
        if container["link"]
          container["link"].each do |link|
            docker.link(link)
          end
        end
        docker.name = container["name"]
      end
    end
  end
end
