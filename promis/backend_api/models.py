from __future__ import unicode_literals

from django.db import models
from django.db.models.fields import DateTimeField, IntegerField, CharField,\
    DateField, FloatField, TextField
from django.db.models.fields.related import ForeignKey
from jsonfield import JSONField
from django.contrib.gis.db.models import LineStringField
from hvad.models import TranslatableModel, TranslatedFields


class Session(models.Model):
    time_begin = DateTimeField()
    time_end = DateTimeField()
    orbit_code = IntegerField(null=True)
    geo_line = LineStringField()
    satellite = ForeignKey('Space_project', null = True)

    class Meta:
        db_table = "sessions" 


class Space_project(TranslatableModel):
    date_start = DateField()
    date_end = DateField()

    translations = TranslatedFields(
        name = TextField(),
        description = TextField()
        )

    class Meta:
        db_table = "space_projects"
        verbose_name = "Space project"
        verbose_name_plural = "Space projects"

    def __str__(self):
        return self.name


class Device(TranslatableModel):
    satellite = ForeignKey('Space_project')

    translations = TranslatedFields(
        name = TextField(),
        description = TextField()
        )
    
    class Meta:
        db_table = "devices"

    def __str__(self):
        return self.name


class Function(TranslatableModel):
    django_func = TextField()

    translations = TranslatedFields(
        description = TextField()
        )
    
    class Meta:
        db_table = "functions"

    def __str__(self):
        return self.description


class Channel(TranslatableModel):
    device = ForeignKey('Device')
    quicklook = ForeignKey('Function', blank=True, null=True)
    parser_func = ForeignKey('Function', related_name = 'parser_func', blank=True, null=True)

    translations = TranslatedFields(
        name = TextField(),
        description = TextField()
        )
    
    class Meta:
        db_table = "channels"

    def __str__(self):
        return self.name


class Unit(TranslatableModel):
    translations = TranslatedFields(
        short_name = TextField(),
        long_name = TextField()
        )
    
    class Meta:
        db_table = "units"

    def __str__(self):
        return self.long_name


class Value(TranslatableModel):
    short_name = CharField(max_length=100)
    units = ForeignKey('Unit')
    
    translations = TranslatedFields(
        name = TextField(),
        description = TextField()
        )
    
    class Meta:
        db_table = "values"
        
    def __str__(self):
        return self.name


class Parameter(TranslatableModel):
    value = ForeignKey('Value')
    conversion = ForeignKey('Function', related_name = 'par_conv', blank=True, null=True)
    conversion_params = TextField(blank = True)
    channel = ForeignKey('Channel')
    quicklook = ForeignKey('Function', related_name = 'par_ql', blank=True, null=True)

    translations = TranslatedFields(
        name = TextField(),
        description = TextField()
        )
    
    class Meta:
        db_table = "parameters"    

    def __str__(self):
        return self.name


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
