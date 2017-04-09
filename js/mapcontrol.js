(function(){
    $(document).ready(function() {
        $('.mapviewtoggle').click(function() {
            if(! $(this).hasClass('active'))
            {
                /* go cesium */
                $('#OL').hide();
                $('#OC').show();
                $('.tool2d').hide();
                $('.tool3d').show();
            } else {
                /* go leaflet */
                $('#OC').hide();
                $('#OL').show();
                $('.tool3d').hide();
                $('.tool2d').show();
            }

            if(GeoObject.drawing) {
                GeoObject.togglePick();
                $('.seltool').removeClass('active');
            }

            GeoObject.toggleFlat();

            return true;
        });

        $('.gridtoggle').click(function() {
            GeoObject.toggleGrid();

            return true;
        });

        $('.fulltoggle').click(function() {
            var full = false;

            if($(this).children('span').hasClass('glyphicon-resize-full'))
            {
                $(this).children('span').removeClass('glyphicon-resize-full');
                $(this).children('span').addClass('glyphicon-resize-small');
                full = true;
            }
            else if ($(this).children('span').hasClass('glyphicon-resize-small'))
            {
                $(this).children('span').removeClass('glyphicon-resize-small');
                $(this).children('span').addClass('glyphicon-resize-full');
                full = false;
            }
            $(this).closest('.panel').toggleClass('panel-fullscreen');

            var height = full ? $(this).closest('.panel').height() : 300;

            if(GeoObject.isflat) $('#leaflet').height(height);
            else $('#cesium').height(height);

            //$(this).closest('.panel-body').toggleClass('panel-fullscreen');

            GeoObject.repaint();

            return true;
        });

        $('.selvoid').click(function() {
            /* finish current selection if active */
            if(GeoObject.drawing) {
                GeoObject.togglePick();
                $('.seltool').removeClass('active');
            }

            GeoObject.discardPreviousSelection();

            return true;
        });

        $('.selreset').click(function() {
            /* finish current selection if active */
            if(GeoObject.drawing) {
                GeoObject.togglePick();
                $('.seltool').removeClass('active');
            }

            GeoObject.resetSelection();
        });

        $('.seltool').click(function() {
            GeoObject.togglePick();
        });

        $('.loctoggler').change(function(e) {
            if($(this).prop('checked')) {
                $('.mapblock').css('visibility', 'visible');
                $('.maplocation').show();
                $('.textlocation').hide();
            } else {
                $('.mapblock').css('visibility', 'hidden');
                $('.maplocation').hide();
                $('.textlocation').show();
            }
        });

        $(document).on('toolsChanged', function(e) {
            if(! e.state) {
                $('.seltool').removeClass('focus');
                $('.seltool').removeClass('active');
                $('.nextpoint').text('');
            }
        });

        $(document).on('selectionChanged', function(e) {
            var reset = $('.selreset');
            var svoid = $('.selvoid');

            /* check if there're selections to waste */
            if(e.count) {
                if(! reset.hasClass('btn-danger')) {
                    reset.addClass('btn-danger');
                    svoid.addClass('btn-warning');
                }
                $('.curselect').empty();

                for(var i = 0; i < e.count; i ++)
                    $('.curselect').append('<li> Part #' + (i + 1) + ', ' + GeoObject.selections[i].length +' points; </li>');
            }
            else {
                $('.curselect').empty();

                if(reset.hasClass('btn-danger')) {
                    reset.removeClass('btn-danger');
                    svoid.removeClass('btn-warning');
                }
            }
        });

        GeoObject.init('cesium', 'leaflet', [51.5, 10.2], function(pos) {
            if(pos) $('.nextpoint').text(' (next point will be at: lat ' + pos[0].toFixed(3) + ', lng ' + pos[0].toFixed(3) + ')');
        });

        registerEvents(); // geoobj too
    });
})();