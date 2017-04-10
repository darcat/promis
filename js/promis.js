/* copyright © 2016 PROMIS & ISR UA */

var PROMIS = {};

PROMIS.projects = new Array;
PROMIS.sessions = new Array;
PROMIS.channels = new Array;
PROMIS.devices = new Array;

PROMIS.currentProj = 0;

function getbyid(array, id) {
  for(var i = 0; i < array.length; i ++)
    if(array[i] && array[i].id && array[i].id == id)
      return array[i];

  return false;
}

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

  PROMIS.alertError = function(text, cont) {
    var a = $('.alert-danger').clone();

    $(a).find('.msg').html(text);
    $(cont !== undefined ? cont : '.alertblock').append(a);
  }

  PROMIS.alertSuccess = function(text, cont) {
    var a = $('.alert-success').clone();

    $(a).find('.msg').html(text);
    $(cont !== undefined ? cont : '.alertblock').append(a);
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

    $('.daterange').daterangepicker({
      locale: {
        format: 'YYYY-MM-DD'
      },
      startDate: '2011-08-01',
      endDate: '2011-10-31'
    });

    $('[data-toggle="tooltip"]').tooltip();

    
      /*{
        $('.emptynotice').show();
        $('.searchbutton').prop('disabled', 'disabled');
        $('.checkparam').hide();
      } else {
        $('.checkparam').show();
        $('.emptynotice').hide();
        $('.searchbutton').removeProp('disabled');
      }*/
    $('#selproj').change(function() {
      var i = parseInt($(this).find('option:selected').val());
      var p = getbyid(PROMIS.projects, i);

      PROMIS.currentProj = i;

      $('.projdesc').html(p.description);
      $('.daterange').data('daterangepicker').setStartDate(p.timelapse.begin);
      $('.daterange').data('daterangepicker').setEndDate(p.timelapse.end);
    });


    $(document).on('change', '.checkparam input[type="checkbox"]', function(e) {
      PROMIS.toggleParam(e.target);
    });

    $('.checkparam input[type="checkbox"]').each(function(i, e){
      PROMIS.toggleParam(e);
    });

    initREST('/api/promis_api.yaml', function(){
      REST.apiMethod('Projects', 'ListProjects').then(function(o){
        PROMIS.projects = o.obj.results;

        $(PROMIS.projects).each(function(i, item) {
          $('#selproj').append('<option value = "' + item.id + '" >' + item.name + '</option>')
        });

        $('#selproj').trigger('change');
      }).catch(function(o){
        PROMIS.alertError('failed to get data from API. Error: ' + o.obj.detail);
      });

    });
  });

})();