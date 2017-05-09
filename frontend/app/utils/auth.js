var AUTH = {};

AUTH.setHost = function(h) {
    AUTH.host = h;//'http://localhost:8081';
}

AUTH.register = function(login, pass, email) {
    var first = '', last = '';

    function getLetter() {
        return Math.floor((Math.random() * 26) + 1);
    }

    /* generate fake name */
    for(var i = 0; i < 10; i ++) {
        first += String.fromCharCode(getLetter() + (i == 0 ? 65 : 97));
        last += String.fromCharCode(getLetter() + (i == 0 ? 65 : 97));
    }

    $.post('/en/user/', { username : login, password : pass, first_name : first, last_name : last, email : email }).
        done(function() { PROMIS.alertSuccess('you have been registered. Please use button on the top to login', '#registerModal .modal-body'); }).
        fail(function(xhr, status, error) { PROMIS.alertError('something went wrong. Please try registering later', '#registerModal .modal-body'); });
};

AUTH.login = function(user, pass) {
    $('#loginModal .modal-body').find('.alert').remove();
    
    $.post('/en/api-auth/login/', { username : user, password : pass, csrfmiddlewaretoken : Cookies.get('csrftoken') }).
        done(function(res) { var x = $(res).find('.text-error'); if(x.length) { PROMIS.alertError($(x).text(), '#loginModal .modal-body'); } }).
        fail(function(xhr, status, error) { window.location = '/' });
}

AUTH.logout = function() {
    $.get('/api-auth/logout/').done(function(){
        window.location = '/';
    })
}

function authSetup(logged) {
    console.log('auth ', logged);
    if (logged) {
        $('.logout-bar').show();
        $('.login-bar').hide();
        $('.loggedonly').show();
    } else {
        $('.logout-bar').hide();
        $('.login-bar').show();
        $('.loggedonly').hide();
    }
    //      $('.welcome').html(getCookieVal('username'));
}

$(document).ready(function(){
    $('.user-logout').click(function(){
        AUTH.logout();
    });

    $('.user-register').click(function(){
        AUTH.register($('.register-username').val(), $('.register-password').val(), $('.register-email'));
    });

    $('.user-login').click(function(){
        AUTH.login($('.login-user').val(), $('.login-password').val());
    });

    $.ajax({
        url: '/en/user',
        type: 'GET',
        success: function() {
            /* logged in */
            authSetup(true)
        },
        error: function(xhr, status, error) {
            /* guest */
            if(xhr.status == 403) authSetup(false);
            if(xhr.status == 405) authSetup(true);
        }
    });
});

/*
    $('.user-login222').click(function(){
        doLogin();

        if (!isLoggedIn())
        {
            $('.logout-bar').hide();
            $('.login-bar').show();
        }
        else
        {
            $('.maybedisabled button').prop('disabled', false);
            $('.loggedonly').show();
            $('.loggednotice').hide();
            $('.login-bar').hide();
            $('.logout-bar').show();
            $('.welcome').html(getCookieVal('username'));
        }
    });

    $('.user-logout222').click(function() {
        setCookie("username", username, -1);
        setCookie("password", password, -1);
        document.location('/');
    });
    */
