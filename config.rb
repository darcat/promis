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
