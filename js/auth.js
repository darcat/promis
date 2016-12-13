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
        document.location('/');
        return true;
    } else {
        $('.login-form').addClass('has-error');
    }
    
    return false;
    
}

$(document).ready(function(){
    if (!isLoggedIn()) {
      $('.logout-form').hide();
      $('.loggedonly').hide();
    } else {
      $('.login-form').hide();
      $('.loggedonly').show();
      $('.welcome').html(getCookieVal('username'));
    }


    $('.user-login').click(function(){
        doLogin();

        if (!isLoggedIn())
        {
            $('.logout-form').hide();
            $('.login-form').show();
        }
        else
        {
            $('.loggedonly').show();
            $('.login-form').hide();
            $('.logout-form').show();
            $('.welcome').html(getCookieVal('username'));
        }
    });

    $('.user-logout').click(function() {
        setCookie("username", username, -1);
        setCookie("password", password, -1);
        document.location('/');
    });
});