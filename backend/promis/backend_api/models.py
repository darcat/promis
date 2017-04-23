from __future__ import unicode_literals

from django.db import models
from django.db.models.fields import ( DateTimeField, IntegerField, CharField,
    DateField, FloatField, TextField )
from django.db.models.fields.related import ForeignKey
from jsonfield import JSONField
from django.contrib.gis.db.models import LineStringField
from hvad.models import TranslatableModel, TranslatedFields, TranslationManager

from django.db.models.signals import post_migrate
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission

from util.functions import get_func_by_name

# TODO: is this class necessary?
class FunctionManager(TranslationManager):
    def get_by_natural_key(self, django_func):
        return self.get(django_func = django_func)

class Function(TranslatableModel):
    django_func = TextField()

    objects = FunctionManager()

    translations = TranslatedFields(
        description = TextField()
        )

    def natural_key(self):
        return (self.django_func,)

    class Meta:
        db_table = "functions"

    def __str__(self):
        return self.description

    def __call__(self, *args, **kwargs):
        # TODO: handle exceptions if function not found
        return get_func_by_name(self.django_func)(*args, **kwargs)

class Session(models.Model):
    time_begin = DateTimeField()
    time_end = DateTimeField()
    orbit_code = IntegerField(null=True)
    geo_line = LineStringField()
    space_project = ForeignKey('Space_project', null = True)

    class Meta:
        db_table = "sessions"

class Space_project(TranslatableModel):
    date_start = DateField()
    date_end = DateField()

    translations = TranslatedFields(
        name = TextField(),
        description = TextField(blank = True)
        )

    # Function that returns functions to check for updates and fetch them
    data_func = ForeignKey('Function', null = True)

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
        description = TextField(blank = True)
        )

    class Meta:
        db_table = "devices"

    def __str__(self):
        return self.name

class Channel(TranslatableModel):
    device = ForeignKey('Device', related_name = 'channels')  # TODO: <- do we need this?
    quicklook = ForeignKey('Function', related_name = 'ch_ql', blank=True, null=True)
    export = ForeignKey('Function', related_name = 'ch_ex', blank=True, null=True)
    parser_func = ForeignKey('Function', related_name = 'parser_func', blank=True, null=True)

    translations = TranslatedFields(
        name = TextField(),
        description = TextField(blank = True)
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
        description = TextField(blank = True)
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
    export = ForeignKey('Function', related_name = 'par_ex', blank=True, null=True)

    translations = TranslatedFields(
        name = TextField(),
        description = TextField(blank = True)
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
    session = ForeignKey('Session', related_name = 'measurements')
    parameter = ForeignKey('Parameter')
    channel = ForeignKey('Channel')
    chn_doc = ForeignKey('Document', related_name = 'chn_doc_id')
    par_doc = ForeignKey('Document', related_name = 'par_doc_id')
    sampling_frequency = FloatField()
    max_frequency  = FloatField()
    min_frequency  = FloatField()

    class Meta:
        db_table = "measurements"
