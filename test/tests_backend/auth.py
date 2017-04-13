# TODO: temporary code until IonosatMicro/promis-backend#69 is stabilised
# Take with a huge grain of salt
# TODO: meaningful exceptions
import requests, re, yaml

def _get_origin():
    # TODO: disover path on our own
    # TODO: discuss whether we need YML at all?
    with open("deploy/promis_api.yaml") as fp:
        return yaml.load(fp)["host"]

class Session:
    '''Temporary class to envelop a session'''

    root_url = "http://" + _get_origin() # TODO: pick up SSL flag from somewhere?

    def _do_request(self, method, url, args, kwargs):
        try:
            if self.csrftoken:
                kwargs["cookies"] = { "csrftoken" : self.csrftoken }
            # It's unlikely that we have sessionid and don't have a csrftoken
            # so, no extra checks on dictionary existence here
            if self.sessionid:
                kwargs["cookies"]["sessionid"] = self.sessionid
        except AttributeError:
            pass

        r = method(self.root_url + url, *args, **kwargs)

        csrftoken = r.cookies.get("csrftoken")
        if csrftoken:
            self.csrftoken = csrftoken
        sessionid = r.cookies.get("sessionid")
        if sessionid:
            self.sessionid = sessionid

        return r

    def get(self, url, *args, **kwargs):
        '''
        Does a requests.get() request and saves the csrft cookie.

        Uses the same cookie if available
        '''
        return self._do_request(requests.get, url, args, kwargs)


    def post(self, url, *args, **kwargs):
        '''
        Does a requests.post() request and saves the csrft cookie.

        Uses the same cookie if available
        '''
        return self._do_request(requests.post, url, args, kwargs)


    def login(self, user, password):
        '''
        Authenticate again the API with a user/password pair.

        Returns True on success, False otherwise. Raises assertions on error conditions.
        '''
        # TODO: make a token version
        # TODO: configurable host:port etc

        # Get the authentication form
        r = self.get("/en/api-auth/login/")
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
        }
        r = self.post("/en/api-auth/login/", data = data, allow_redirects=False)
        return r.status_code == 302
