from .database import Database
from . import httpdrone

import json
import os


db = Database(os.environ['DATABASE'])
port = int(os.environ['PORT'])


def handle_post(request):
    if request.path != '/puzzle-complete':
        return httpdrone.Response(status=404)

    fields = json.loads(request.body)
    db.add_survey_result(fields)

    return httpdrone.Response()  # success


httpdrone.serve(('localhost', port), POST=handle_post)
