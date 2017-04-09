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

      PROMIS.orbit = [];

      $.each(dgeo[0].concat(dgeo[1]), function(i, item) {
        poln.push({lat: item[1], lng: item[0]});
        PROMIS.orbit.push([item[1], item[0]]);
      });

      // clean previous orbit
      GeoObject.clearGeolines();

      //orbit = GeoObject.makeGeoline(PROMIS.orbit);
    });
  }



  /* main func */
$(document).ready(function() {
    $('.emptynotice').hide();

    $('input[name="daterange"]').daterangepicker({
      locale: {
        format: 'YYYY-MM-DD'
      },
      startDate: '2011-08-01',
      endDate: '2011-10-31'
    });

    $('[data-toggle="tooltip"]').tooltip();

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

    $(document).on('change', '.checkparam input[type="checkbox"]', function(e) {
      PROMIS.toggleParam(e.target);
    });

    $('.checkparam input[type="checkbox"]').each(function(i, e){
      PROMIS.toggleParam(e);
    });
  });

})();