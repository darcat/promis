from __future__ import unicode_literals

from django.db import models
from django.db.models.fields import DateTimeField, IntegerField, CharField,\
    DateField, FloatField, TextField
from django.db.models.fields.related import ForeignKey
from jsonfield import JSONField
from django.contrib.gis.db.models import LineStringField

# Create your models here.

class Session(models.Model):
    time_begin = DateTimeField()
    time_end = DateTimeField()
    orbit_code = IntegerField(null=True)
    geo_line = LineStringField()

    class Meta:
        db_table = "sessions" 

class Translation(models.Model):
    langcode = CharField(max_length = 2)
    text = TextField(default = "")

    class Meta:
        db_table = "translations"
        
    def __str__(self):
        return self.text.encode('utf-8')

class Space_project(models.Model):
    name = ForeignKey('Translation', unique = True, related_name = 'sp_name'   )
    description = ForeignKey('Translation', related_name = 'sp_description')
    date_start = DateField()
    date_end = DateField()

    class Meta:
        db_table = "space_projects"

    def __str__(self):
        return self.description.text.encode('utf-8')

class Device(models.Model):
    name = ForeignKey('Translation', related_name = 'dev_name')
    description = ForeignKey('Translation', related_name = 'dev_description')
    satellite = ForeignKey('Space_project')
    
    class Meta:
        db_table = "devices"

    def __str__(self):
        return self.name.text.encode('utf-8')


class Function(models.Model):
    description = ForeignKey('Translation', related_name = 'func_description')
    django_func = TextField()
    
    class Meta:
        db_table = "functions"

    def __str__(self):
        return self.description.text.encode('utf-8')

class Channel(models.Model):
    name = ForeignKey('Translation', related_name = 'ch_name')
    description = ForeignKey('Translation', related_name = 'ch_description')
    device = ForeignKey('Device')
    quicklook = ForeignKey('Function', null = True)
    parser_func = ForeignKey('Function', related_name = 'parser_func', null = True)
    
    class Meta:
        db_table = "channels"

    def __str__(self):
        return self.description.text.encode('utf-8')


class Unit(models.Model):
    long_name = ForeignKey('Translation', related_name = 'u_lname')
    short_name = ForeignKey('Translation', related_name = 'u_sname')
    
    class Meta:
        db_table = "units"

class Value(models.Model):
    name = ForeignKey('Translation', related_name = 'val_name')
    description = ForeignKey('Translation', related_name = 'val_description')
    short_name = CharField(max_length=100)
    units = ForeignKey('Unit')
    
    class Meta:
        db_table = "values"
        
    def __str__(self):
        return self.description.text.encode('utf-8')


class Parameter(models.Model):
    name = ForeignKey('Translation', related_name = 'par_name')
    description = ForeignKey('Translation', related_name = 'par_description')
    value = ForeignKey('Value')
    conversion = ForeignKey('Function', related_name = 'par_conv')
    conversion_params = TextField()
    channel = ForeignKey('Channel')
    quicklook = ForeignKey('Function', related_name = 'par_ql')
    
    class Meta:
        db_table = "parameters"    

    def __str__(self):
        return self.description.text.encode('utf-8')

class Document(models.Model):
    last_mod = DateTimeField(auto_now_add = True)
    json_data = JSONField()
    
    class Meta:
        db_table = "documents"

class Measurement(models.Model):
    session = ForeignKey('Session')
    parameter = ForeignKey('Parameter')
    channel = ForeignKey('Channel')
    chn_doc = ForeignKey('Document', related_name = 'chn_doc_id')
    par_doc = ForeignKey('Document', related_name = 'par_doc_id')
    sampling_frequency = FloatField()
    max_frequency  = FloatField()
    min_frequency  = FloatField()
    
    class Meta:
        db_table = "measurements"
