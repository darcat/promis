/* copyright © 2016 PROMIS & ISR UA */

var PROMIS = {};

(function() {
  var map = null;
  var orbit = null;

  PROMIS.toggleParam = function(obj) {
    var i = $(obj).parent().parent().parent();

    if(obj.checked) {
      $(i).css('color', 'black');
    } else {
      $(i).css('color', 'gray');
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

  PROMIS.showOnTheMap = function() {
    var bounds = new google.maps.LatLngBounds();

    bounds.extend(new google.maps.LatLng($('#geolat1').val(), $('#geolon1').val()));
    bounds.extend(new google.maps.LatLng($('#geolat2').val(), $('#geolon2').val()));

    map.fitBounds(bounds);
  }

  /* main func */
  $(document).ready(function(){

    $('.emptynotice').hide();

    $('input[name="daterange"]').daterangepicker();

    $('[data-toggle="tooltip"]').tooltip();

    $('.showonthemap').click(function(){
      PROMIS.showOnTheMap();
    });

    $('#sel1').change(function(){
      if($('#sel1 option:selected').val() != 'a') {
        $('.emptynotice').show();
        $('.searchbutton').prop('disabled', 'disabled');
        $('.checkparam').hide();
      } else {
        $('.checkparam').show();
        $('.emptynotice').hide();
        $('.searchbutton').removeProp('disabled');
      }
    });

    $('.quicklook').click(function(e){
      
      //alert($(e.target).parent().parent().attr('data-title'));
      /*QUICKLOOK.data = [ { x: [0, 1, 2, 3, 4], 
               y: [0, 1, 2, 3, Math.floor((Math.random() * 10) + 1)] } ] ;*/

      QUICKLOOK.plot();
    });

    $(document).on('change', '.checkparam input[type="checkbox"]', function(e) {
      PROMIS.toggleParam(e.target);
    });

    $('.checkparam input[type="checkbox"]').each(function(i, e){
      PROMIS.toggleParam(e);
    });
  });

})();