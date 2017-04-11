/* TODO: ES module */

REST = {
    apiHost : 'http://something',
    swagger : null,
    ready : false,
    lang : 'en',

    csrfSafeMethod : function(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    },

    setLanguage : function(code) {
        this.lang = code;
        $.post(this.apiHost + '/i18n/setlang/', { language : code });
    },

    apiMethod : function(tag, name, params) {
        // https://github.com/github/fetch#sending-cookies
        if(this.ready) return this.swagger[tag][name](params); /* Promise */
        else console.log('REST is not ready yet');
    }
};

function initREST (schemaurl, callback)
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
            crossDomain: false,
            beforeSend: function(xhr, settings) {
                if (! REST.csrfSafeMethod(settings.type)) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });

        REST.swagger = swagger;
        REST.apiHost = swagger.schemes[0] + '://' + swagger.host;

        REST.ready = true;

        callback();
    }).catch(function(error){
        alert('Failed to init REST: ' + error);
    });
}
