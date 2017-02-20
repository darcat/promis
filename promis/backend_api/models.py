from __future__ import unicode_literals

from django.db import models
from django.db.models.fields import DateTimeField, IntegerField, CharField,\
    DateField, FloatField, TextField
from django.db.models.fields.related import ForeignKey
from jsonfield import JSONField
from django.contrib.gis.db.models import LineStringField

# Create your models here.

class Sessions(models.Model):
    time_begin = DateTimeField()
    time_end = DateTimeField()
    orbit_code = IntegerField(null=True)
    geo_line = LineStringField()

    class Meta:
        db_table = "sessions" 

class Translations(models.Model):
    langcode = CharField(max_length = 2)
    text = TextField(default = "")

    class Meta:
        db_table = "translations"

class Space_projects(models.Model):
    name = ForeignKey('Translations', unique = True, related_name = 'sp_name'   )
    description = ForeignKey('Translations', related_name = 'sp_description')
    date_start = DateField()
    date_end = DateField()

    class Meta:
        db_table = "space_projects"

class Devices(models.Model):
    name = ForeignKey('Translations', related_name = 'dev_name')
    description = ForeignKey('Translations', related_name = 'dev_description')
    satellite = ForeignKey('Space_projects')
    
    class Meta:
        db_table = "devices"

class Functions(models.Model):
    description = ForeignKey('Translations', related_name = 'func_description')
    django_func = TextField()
    
    class Meta:
        db_table = "functions"

class Channels(models.Model):
    name = ForeignKey('Translations', related_name = 'ch_name')
    description = ForeignKey('Translations', related_name = 'ch_description')
    device = ForeignKey('Devices')
    quicklook = ForeignKey('Functions', null = True)
    parser_func = ForeignKey('Functions', related_name = 'parser_func', null = True)
    
    class Meta:
        db_table = "channels"

class Units(models.Model):
    long_name = ForeignKey('Translations', related_name = 'u_lname')
    short_name = ForeignKey('Translations', related_name = 'u_sname')
    
    class Meta:
        db_table = "units"

class Values(models.Model):
    name = ForeignKey('Translations', related_name = 'val_name')
    description = ForeignKey('Translations', related_name = 'val_description')
    short_name = CharField(max_length=100)
    units = ForeignKey('Units')
    
    class Meta:
        db_table = "values"

class Parameters(models.Model):
    name = ForeignKey('Translations', related_name = 'par_name')
    description = ForeignKey('Translations', related_name = 'par_description')
    value = ForeignKey('Values')
    conversion = ForeignKey('Functions', related_name = 'par_conv')
    conversion_params = TextField()
    channel = ForeignKey('Channels')
    quicklook = ForeignKey('Functions', related_name = 'par_ql')
    
    class Meta:
        db_table = "parameters"    

class Documents(models.Model):
    last_mod = DateTimeField(auto_now_add = True)
    json_data = JSONField()
    
    class Meta:
        db_table = "documents"

class Measurements(models.Model):
    session = ForeignKey('Sessions')
    parameter = ForeignKey('Parameters')
    channel = ForeignKey('Channels')
    chn_doc = ForeignKey('Documents', related_name = 'chn_doc_id')
    par_doc = ForeignKey('Documents', related_name = 'par_doc_id')
    sampling_frequency = FloatField()
    max_frequency  = FloatField()
    min_frequency  = FloatField()
    
    class Meta:
        db_table = "measurements"
