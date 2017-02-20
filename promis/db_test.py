import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "promis.settings")
import django
django.setup()

from backend_api import models

for msr in models.Measurements.objects.all():
    print msr.max_frequency

