from __future__ import unicode_literals

from django.db import models
from django.db.models.fields import DateTimeField, IntegerField, CharField,\
    DateField
from django.db.models.fields.related import ForeignKey


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
    
    
    
    
    