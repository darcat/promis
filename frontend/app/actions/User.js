import { Enum } from '../constants/User';
import Cookies from 'js-cookie';
import axios from 'axios';


export default {
    login : function(user, pass) {
        return function(dispatch) {
            const loginFailed = 'Login failed, check username and password';

            dispatch({
                type: Enum.LoginRequest,
                payload: true
            });

            // get csrf from page instead of server
            // .....
   
            axios.get('/en/api-auth/login/').then(function(response) {
                let regex = /csrfmiddlewaretoken' value='([^']*)/g;
                let match = regex.exec(response.data);
                let csrf = match[1];
                                                
                let data = new FormData();
                data.append('username', user);
                data.append('password', pass);
                data.append('csrfmiddlewaretoken', csrf);
                
                axios.post('/en/api-auth/login/', data, { 
                    headers: { 'Content-Type': 'multipart/form-data' },
                    maxRedirects: 0
                }).then(function(res)
                {
                    dispatch({
                        type: res.data[0].username ? Enum.LoginSuccess : Enum.LoginFailed,
                        payload: res.data[0].username ? true : loginFailed
                    });
                    if (res.data[0].username) window.location = '/';
                }).catch(function(error) {
                    dispatch({
                        type: Enum.LoginFailed,
                        payload: loginFailed
                    });
                })
            }).catch(function(error)
            {
                dispatch({
                    type: Enum.LoginFailed,
                    payload: loginFailed
                });
            });
        }
    },

    register : function(email, user, pass) {
        // wiped
    },

    logout : function() {
        return function(dispatch) {
            axios.get('/api-auth/logout/').then(function() {
                window.location = '/';
            });
        }
    },

    profile : function() {
        return function(dispatch) {
            dispatch({
                type: Enum.ProfileRequest
            });

            axios.get('/en/user')
            .then(function(res) {
                dispatch({
                    type: Enum.ProfileSuccess,
                    payload: {
                        id: 0, // stub
                        name: res.data[0].username
                    }
                })
            })
            .catch(function(error) {
                dispatch({
                    type: Enum.ProfileFailed,
                    payload: true
                })
            });
        }
    }
}