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

# Inspiration drawn from: http://blog.scottlowe.org/2015/02/11/multi-container-docker-yaml-vagrant/
require "yaml"

vagrant_root = File.dirname(__FILE__) + "/"

# Default options
$conf = YAML.load_file(vagrant_root + "conf/defaults.yml")

# Overrides with user-defined options
if File.file?(vagrant_root + "conf/conf.yml")
  $user_conf = YAML.load_file(vagrant_root + "conf/conf.yml")
  $user_conf.each do |override|
    $conf[override[0]] = override[1]
  end
end

# Easy to use development version
if $conf["development_setup"]
  $conf["code_reload"] = true unless $user_conf.key?("code_reload")
  $conf["disable_ssl"] = true unless $user_conf.key?("disable_ssl")
  $conf["servername_web"] = "localhost" unless $user_conf.key?("servername_web")
  $conf["servername_api"] = "localhost" unless $user_conf.key?("servername_api")
  $conf["port_web"] = 8081 unless $user_conf.key?("port_web")
  $conf["expose_db"] = true unless $user_conf.key?("expose_db")
  $conf["django_debug"] = true unless $user_conf.key?("django_debug")
  $conf["django_type"] = "dev" unless $user_conf.key?("django_type")
  $conf["django_key"] = "8f3@*c8-gz!h(fm_4n$-tc-@9!32#bn5m9mmxj$k38or1&y&%x" unless $user_conf.key?("django_key")
end

# Fix ports for oblivious people
$conf["port_web"] = 80 if $conf["port_web"] == 443 && $conf["disable_ssl"]
$conf["port_web"] = 443 if $conf["port_web"] == 80 && !$conf["disable_ssl"]


# Compose port-key specifications
if $conf["disable_ssl"]
  $conf["port_key_web"] = $conf["port_web"].to_s
else
  $conf["port_key_web"] = $conf["port_web"].to_s + " ssl;\n" +
    "ssl_certificate " + $conf["ssl_prefix"] + "/" + $conf["ssl_cert_web"] + ";\n" +
    "ssl_certificate_key " + $conf["ssl_prefix"] + "/" + $conf["ssl_key_web"]
end

# Generate Django key if it's still empty
if $conf["django_key"].to_s == ""
  # Adapted from: http://stackoverflow.com/questions/88311/how-best-to-generate-a-random-string-in-ruby
  # NOTE: Pseudo-random
  o = [('a'..'z'), ('0'..'9'), ('!'..')')].map(&:to_a).flatten
  $conf["django_key"] = (0...50).map { o[rand(o.length)] }.join
end

# Generate a config line for promis.conf determining whether we use static builds or a live nodejs server
$conf["web_root_config"] = if $conf["code_reload"] then "proxy_pass http://localhost:3000;" else "" end
