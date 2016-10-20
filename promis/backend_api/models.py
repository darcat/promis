from __future__ import unicode_literals

from django.db import models
from django.db.models.fields import DateTimeField, IntegerField, CharField,\
    DateField, FloatField, TextField
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
    name = ForeignKey('Translations', unique = True, related_name = 'sp_name')
    description = ForeignKey('Translations', related_name = 'sp_descrioption')
    date_start = DateField()
    date_end = DateField()
    
class Devices(models.Model):
    name = ForeignKey('Translations', related_name = 'dev_name')
    description = ForeignKey('Translations', related_name = 'dev_description')
    satellite = ForeignKey('Space_projects')
    
class Functions(models.Model):
    description = ForeignKey('Translations', related_name = 'func_description')
    django_func = TextField()

class Channels(models.Model):
    name = ForeignKey('Translations', related_name = 'ch_name')
    description = ForeignKey('Translations', related_name = 'ch_description')
    device = ForeignKey('Devices')
    quicklook = ForeignKey('Functions')
    
class Units(models.Model):
    long_name = ForeignKey('Translations', related_name = 'u_lname')
    short_name = ForeignKey('Translations', related_name = 'u_sname')

class Values(models.Model):
    name = ForeignKey('Translations', related_name = 'val_name')
    description = ForeignKey('Translations', related_name = 'val_description')
    short_name = CharField(max_length=100)
    units = ForeignKey('Units')

class Parameters(models.Model):
    name = ForeignKey('Translations', related_name = 'par_name')
    description = ForeignKey('Translations', related_name = 'par_description')
    value = ForeignKey('Values')
    conversion = ForeignKey('Functions', related_name = 'par_conv')
    conversion_params = TextField()
    channel = ForeignKey('Channels')
    quicklook = ForeignKey('Functions', related_name = 'par_ql')

class Documents(models.Model):
    last_mod = DateTimeField(auto_now_add = True)
    json_data = JSONField()
    
class Measurements(models.Model):
    session = ForeignKey('Sessions')
    parameter = ForeignKey('Parameters')
    channel = ForeignKey('Channels')
    chn_doc_id = ForeignKey('Documents', related_name = 'chn_doc_id')
    par_doc_id = ForeignKey('Documents', related_name = 'par_doc_id')
    sampling_frequency = FloatField()
    max_frequency  = FloatField()
    min_frequency  = FloatField()
