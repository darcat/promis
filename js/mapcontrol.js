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

        $('.selclear').click(function() {
            GeoObject.clearSelection();

            return true;
        });

        $('#polypicker').change(function() {
            GeoObject.togglePick();
        });

        GeoObject.init('cesium', 'leaflet', [51.5, 10.2], function(pos) {
            if(pos) $('.nextpoint').text(' (next point will be at: lat ' + pos[0].toFixed(3) + ', lng ' + pos[0].toFixed(3) + ')');
        });

        registerEvents(); // geoobj too
    });
})();