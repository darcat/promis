from rest_framework.views import exception_handler
from rest_framework.exceptions import PermissionDenied, NotAuthenticated

def promis_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    print (type(exc))
    response = exception_handler(exc, context)
    
    # Now add the HTTP status code to the response.
    if response is not None:
        if isinstance(exc, PermissionDenied):
            response.status_code = 401
            
        if isinstance(exc, NotAuthenticated):
            response.status_code = 401

    return response