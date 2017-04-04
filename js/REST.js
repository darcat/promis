/* TODO: ES module */

REST = {
    apiHost : 'http://something',
    swagger : null,

    csrfSafeMethod : function(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    },

    setLanguage : function(code) {
        $.post(this.apiHost + '/i18n/setlang/', { language : code });
    },

    apiMethod : function(tag, name, params) {
        return this.swagger[tag][name](params); /* Promise */
    }
};

function initREST (schemaurl)
{
    var csrftoken = Cookies.get('csrftoken');
    var apiclient = new SwaggerClient({
        url : schemaurl,
        usePromise : true
    }).then(function(swagger) {
        $.ajaxSetup({
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function(xhr, settings) {
                if (! REST.csrfSafeMethod(settings.type) /*&& !this.crossDomain*/) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });

        REST.swagger = swagger;
        REST.apiHost = swagger.schemes[0] + '://' + swagger.host;

        console.log('REST ready');
    }).catch(function(error){
        alert('Failed to init REST: ' + error);
    });
}
