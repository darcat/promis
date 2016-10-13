from __future__ import unicode_literals

from django.db import models
from django.db.models.fields import DateTimeField, IntegerField, CharField,\
    DateField, FloatField
from django.db.models.fields.related import ForeignKey
from jsonfield import JSONField

# Create your models here.

class Sessions(models.Model):
    time_begin = DateTimeField()
    time_end = DateTimeField()
    orbit_code = IntegerField(null=True)
    geo_line = TextField()

class Translations(models.Model):
    langcode = CharField(max_length = 2)
    text = TextField()

class Space_projects(models.Model):
    name = ForeignKey('Translations', unique = True)
    description = ForeignKey('Translations')
    date_start = DateField()
    date_end = DateField()
    
class Devices(models.Model):
    name = ForeignKey('Translations')
    description = ForeignKey('Translations')
    satellite = ForeignKey('Space_progects')
    
class Functions(models.Model):
    description = ForeignKey('Translations')
    django_func = TextField()

class Channels(models.Model):
    name = ForeignKey('Translations')
    description = ForeignKey('Translations')
    device = ForeignKey('Devices')
    quicklook = ForeignKey('Functions')
    
class Units(models.Model):
    long_name = ForeignKey('Translations')
    short_name = ForeignKey('Translations')

class Values(models.Model):
    name = ForeignKey('Translations')
    description = ForeignKey('Translations')
    short_name = CharField(max_length=100)
    units = ForeignKey('Units')

class Parameters(models.Model):
    name = ForeignKey('Translations')
    description = ForeignKey('Translations')
    value = ForeignKey('Values')
    conversion = ForeignKey('Functions')
    conversion_params = TextField()
    channel = ForeignKey('Channels')
    quicklook = ForeignKey('Functions')

class Documents(models.Model):
    last_mod = DateTimeField(auto_now_add = True)
    json_data = JSONField()
    
class Measurements(models.Model):
    session = ForeignKey('Sessions')
    parameter = ForeignKey('Parameters')
    channel = ForeignKey('Channels')
    chn_doc_id = ForeignKey('Documents')
    par_doc_id = ForeignKey('Documents')
    sampling_frequency = FloatField()
    max_frequency  = FloatField()
    min_frequency  = FloatField()
    
    