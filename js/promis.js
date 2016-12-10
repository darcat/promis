/* copyright © 2016 PROMIS & ISR UA */

var PROMIS = {};

(function() {
  var map = null;
  var orbit = null;

  PROMIS.toggleParam = function(obj) {
    var i = $(obj).parent().parent().parent().find('.form-control');

    if(obj.checked) {
      //l.prop('disabled', false);
      i.prop('disabled', false);
    } else {
      i.prop('disabled', true);
      //l.prop('disabled', true);
    }
  }

  function displaySession(number) {
    $.getJSON('data/session' + number + '.json', function(json) {
      var dgeo = json.geometry.coordinates;
      var poln = [];

      $.each(dgeo[0].concat(dgeo[1]), function(i, item) {
        poln.push({lat: item[1], lng: item[0]});
      });

      // clean previous orbit
      if (orbit) {
        orbit.setMap(null);
      }

      orbit = new google.maps.Polyline({
        path: poln,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      orbit.setMap(map);
      //https://developers.google.com/maps/documentation/javascript/examples/polyline-simple
    });
  }

  PROMIS.setupMap = function() {
    var mapCanvas = document.getElementById("map");
    var mapOptions = {
      center: new google.maps.LatLng(51.5, 1), zoom: 1
    };
    
    map = new google.maps.Map(mapCanvas, mapOptions);
    displaySession(3);
  }

  /* main func */
  $(document).ready(function(){
    $(document).on('change', '.checkparam input[type="checkbox"]', function(e) {
      PROMIS.toggleParam(e.target);
    });

    $('.checkparam input[type="checkbox"]').each(function(i, e){
      PROMIS.toggleParam(e);
    });
  });

})();