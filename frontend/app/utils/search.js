var DATA = {};

(function(){

    DATA.ez1 = '20110831_2-ez-lf.json';
    DATA.ez2 = '20110905-ez-lf.json';
    DATA.ez3 = '20110914-ez-lf.json';

    DATA.mw1 = 'BeCsv.json';
    //DATA.mw2 = '';

    DATA.dates = ['2011-08-31', '2011-09-05', '2011-09-14'];

})();

function makeResult(data, date, name, size, href) {
    var r = $('.resultsrow').clone();

    $(r).removeClass('resultsrow');
    $(r).addClass('theresult');
    $(r).attr('data-name', data);
    $(r).find('.resultsdate').html(date);
    $(r).find('.resultssize').html(size);
    $(r).find('.resultsname').html(name);
    $(r).find('.download').closest('form').attr('action', '/download/' + href);

    $(r).find('.quicklook').click(function(e) {
      var data = $(e.target).closest('.theresult').attr('data-name');

      if(data.indexOf('ez') !== -1) {
        /* ez */
        QUICKLOOK.x_label = 'Seconds';
        QUICKLOOK.y_label = 'Joules per Coulomb'
      } else {
        /* mwc */
        QUICKLOOK.x_label = '1 Hertz';
        QUICKLOOK.y_label = 'Teslas'
      }

      QUICKLOOK.bind(data);
    });

    /* make sure buttons are really disabled */
    $(r).find('.maybedisabled').click(function(e){
        if(!isLoggedIn()) {
            e.stopPropagation();
        }
    });

    $(r).show();


    $('.searchresults tbody').append(r);
}

function geoformat(arr) {
    return arr;
}

$(document).ready(function(){
    $('.mapblock').css('visibility', 'hidden');
    $('.resultsblock').hide();
    $('.resultsrow').hide();
    $('.searchresults').hide();
    $('.loggednotice').hide();

    /* assume orbit is already loaded */
    $('.searchbutton').click(function(){
        /* search by date */
        
        var intime = false, latlon = false, fparams = false;
        var range = $('.daterange').val().split(' - ');
        /*var mrange = moment.range(moment(range[0], 'YYYY-MM-DD'), moment(range[1], 'YYYY-MM-DD'));

        $.each(DATA.dates, function(i, d){
            var x = moment(d, 'YYYY-MM-DD');
            intime = x.within(mrange);
        });*/

        /*
        if(intime) {
            $.each(PROMIS.orbit, function(i, ll){
                if(PROMIS.bounds.contains(ll)) {
                    latlon = true;
                }
            });

            $('.resultsblock').show(); */

            /* clean from old searches */
        $('.searchresults .theresult').remove();

        var selection = null;

        if(! $('.loctoggler').prop('checked'))
            selection = geoformat([[$('#geolat1').val(), $('#geolon1').val()], [$('#geolat2').val(), $('#geolon2').val()]]);
        else
            selection = geoformat(GeoObject.getSelection());

        REST.apiMethod('Sessions', 'ListSessions', 
            { satellite : PROMIS.currentProj, 
                fromtime: range[0],
                  totime: range[1]/*,
                 polygon: selection*/
            }).then(function(o){
                var c = o.obj.count;

                $('.resultscount').html(c + ' sessions has been found');

                if(c) {
                    var b = $("<button class = 'btn btn-default'>Show/hide on map</button>");

                    $(b).click(function(){
                        $('.loctoggler').bootstrapToggle('on'); /* open map if not yet */
                        if(GeoObject.geolines.length) {
                            GeoObject.clearGeolines();
                            GeoObject.geolines = new Array();
                        } else {
                            $.each(o.obj.results, function(i, item) {
                                GeoObject.makeGeoline(item.geo_line);
                            });
                        }
                    });

                    PROMIS.sessions = o.obj.results;

                    $('.resultsblock').append(b);
                }

                $('.resultsblock').show();
            }).catch(function(o){
                PROMIS.alertError('failed to get data from API. Error: ' + o.obj.detail);
            });
            /* params */
        /*
            if(latlon) {
                var q = 0;

                $('.checkparam input').each(function(i, objp){
                    if($(objp).is(':checked')) {
                        /* pick earliest date */
                        /*
                        switch(i) {
                            case 0: // ez 
                                $.each(DATA.dates, function(i, d){
                                    var z = moment(d, 'YYYY-MM-DD');

                                    if(z.within(mrange)) {
                                        var n = 'ez' + String(i + 1);
                                        makeResult(n, d, 'Electric potential (EZ)', '1.5 KB', DATA[n]);
                                        q++;
                                    }
                                });
                            break;

                            case 1: // mwc x 
                                makeResult('mw1', DATA.dates[0], 'Magnetic field X (MWC)', '386 KB', DATA.mw1);
                                q ++;
                            break;
                        }
                    }
                });
                if(q) {
                    $('.resultscount').html(q + ' result(s) has been found');
                    $('.searchresults').show();

                    if(!isLoggedIn()) {
                        $('.loggednotice').show();
                        $('.maybedisabled button').prop('disabled', true);
                    } else {
                        $('.loggednotice').hide();
                        $('.maybedisabled button').prop('disabled', false);
                    }
                }
                else {
                    // hate duplicating code...
                    $('.resultscount').html('Nothing has been found');
                    $('.searchresults').hide();
                }
            } else {
                $('.resultscount').html('Nothing has been found');
                $('.searchresults').hide();
            }
        }*/
    });
});

