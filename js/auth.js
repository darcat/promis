var AUTH = {};

AUTH.host = 'http://localhost:8081';

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

    $.post(API.host + '/en/user/', { username : login, password : pass, first_name : first, last_name : last, email : email }).
        done(function() { PROMIS.alertSuccess('you have been registered. Please use button on the top to login', '#registerModal .modal-body'); }).
        fail(function(xhr, status, error) { PROMIS.alertError('something went wrong. Please try registering later', '#registerModal .modal-body'); });
};

AUTH.login = function(user, pass) {
    $.post(AUTH.host + '/en/api-auth/login/', { username : user, password : pass, csrfmiddlewaretoken : $.cookie('csrftoken') }).
        done(function() { window.location('/'); }).
        fail(function(xhr, status, error) { PROMIS.alertError('failed to log in. ' + error, '#loginModal .modal-body')});
}

function getCookieVal(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function isLoggedIn()
{
    return ((getCookieVal("username") != "") && (getCookieVal("password") != ""))
}

function doLogin()
{
    $('.login-form').removeClass('has-error');
    username = $("#username").val();
    password = $("#password").val();

    console.log(username + "|" + password);

    // ADD field validation here
    if ((username == "") || (password == ""))
    {
        // ADD empty field validation here
        $('.login-form').addClass('has-error');
        return false;
    }
    
    //Add username/password validation here

    if ((username == "test") && (password == "test"))
    {
        setCookie("username", username, 1);
        setCookie("password", password, 1);
        return true;
    } else {
        $('.login-form').addClass('has-error');
    }
    
    return false;
    
}

function authSetup(logged) {
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
