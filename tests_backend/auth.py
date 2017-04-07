# TODO: temporary code until IonosatMicro/promis-backend#69 is stabilised
# Take with a huge grain of salt
# TODO: meaningful exceptions
import requests, re

class Session:
    '''Temporary class to envelop a session'''

    def _do_request(self, method, args, kwargs):
        try:
            if self.csrftoken:
                kwargs["cookies"] = { "csrftoken" : self.csrftoken }
        except AttributeError:
            pass
        r = method(*args, **kwargs)
        self.csrftoken = r.cookies.get("csrftoken")

        return r

    def get(self, *args, **kwargs):
        '''
        Does a requests.get() request and saves the csrft cookie.

        Uses the same cookie if available
        '''
        return self._do_request(requests.get, args, kwargs)


    def post(self, *args, **kwargs):
        '''
        Does a requests.post() request and saves the csrft cookie.

        Uses the same cookie if available
        '''
        return self._do_request(requests.post, args, kwargs)


    def login(self, user, password):
        '''
        Authenticate again the API with a user/password pair.

        Returns True on success, False otherwise. Raises assertions on error conditions.
        '''
        # TODO: make a token version
        # TODO: configurable host:port etc

        # Get the authentication form
        r = self.get("http://localhost:8081/en/api-auth/login/")
        assert r.status_code == 200, "Login form unavailable"
        assert r.cookies.get("csrftoken"), "No csrftoken in the response"

        # Save security token
        m = re.search(r"csrfmiddlewaretoken' value='([^']*)", r.text, re.M)
        assert m and len(m.groups()) == 1, "No middlewaretoken token in the response"
        self.middlewaretoken = m.group(1)

        # Try to login
        data = {
            "username": user,
            "password": password,
            "csrfmiddlewaretoken": self.middlewaretoken,
            "next": "/api/",
        }
        r = self.post("http://localhost:8081/en/api-auth/login/", data = data)
        return bool(re.search(r"/api/$", r.url))
