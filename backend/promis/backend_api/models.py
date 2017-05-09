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

from rest_framework.exceptions import NotAuthenticated, NotFound, MethodNotAllowed

from importlib import import_module

# TODO: can we do smth like this and inherit all over?
"""
class NameAsStrMixin:
    def __str__(self):
        return self.name

class NameDescriptionModel(TranslatableModel):
    '''Something that has a name and a description'''
    translations = TranslatedFields(
        name = TextField(),
        description = TextField(blank = True)
        )

    class Meta:
        abstract = True
"""

# Actual classes
class ClassManager(TranslationManager):
    def get_by_natural_key(self, name):
        return self.get(name = name)


class Class(TranslatableModel):
    name = TextField()

    objects = ClassManager()

    translations = TranslatedFields(
        description = TextField()
        )

    def natural_key(self):
        return (self.name,)

    class Meta:
        db_table = "classes"

    def __str__(self):
        return self.description

    def get_class_obj(self):
        '''
        Returns a Python class object identified by self.name

        No safety checks are executed, make sure to catch stuff.
        '''
        # Breaking down to components
        path_comp = self.name.rsplit(sep=".", maxsplit=1)

        # Importing the module
        module = import_module(path_comp[0])

        # Looking for the class
        return getattr(module, path_comp[1])

    def __call__(self, *args, **kwargs):
        '''
        Instantiates the class identified by self.name
        and passes args and kwargs to its constructor
        '''
        try:
            return self.get_class_obj() (*args, **kwargs)
        except (ImportError, AttributeError) as e:
            raise MethodNotAllowed(self.name,
                detail = "Can't create an object of class %s: '%s'. Please contact the maintainer." % (self.name, str(e)))


class Session(models.Model):
    time_begin = DateTimeField()
    time_end = DateTimeField()
    orbit_code = IntegerField(null = True)
    # TODO: http://spatialreference.org/ref/epsg/4979/postgis/ 
    geo_line = LineStringField(dim = 3, srid = 4979)
    space_project = ForeignKey('Space_project', null = True)

    class Meta:
        db_table = "sessions"


class Space_project(TranslatableModel):
    klass = ForeignKey('Class', null = True)
    def instance(self):
        '''
        Create a new object of the stored behaviour class and
        connect it to the calling object.
        '''
        return self.klass(self) if self.klass else None

    date_start = DateField()
    date_end = DateField()

    translations = TranslatedFields(
        name = TextField(),
        description = TextField(blank = True)
        )

    def __str__(self):
        return self.name

    class Meta:
        db_table = "space_projects"
        verbose_name = "Space project"
        verbose_name_plural = "Space projects"


class Device(TranslatableModel):
    space_project = ForeignKey('Space_project')

    translations = TranslatedFields(
        name = TextField(),
        description = TextField(blank = True)
        )

    def __str__(self):
        return self.name

    class Meta:
        db_table = "devices"


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

    def __str__(self):
        return self.name

    class Meta:
        db_table = "values"


class Channel(TranslatableModel):
    value = ForeignKey('Value') # TODO: null = True for ultra proprietary devices whose units we just don't know?
    exponent = IntegerField(default = 0)
    device = ForeignKey('Device', related_name = 'channels')  # TODO: <- do we need this?
    klass = ForeignKey('Class', null = True)

    translations = TranslatedFields(
        name = TextField(),
        description = TextField(blank = True)
        )

    def __str__(self):
        return self.name

    class Meta:
        db_table = "channels"


class Parameter(TranslatableModel):
    value = ForeignKey('Value')
    exponent = IntegerField(default = 0)
    #conversion_params = TextField(blank = True) TODO hmm?
    channel = ForeignKey('Channel')
    klass = ForeignKey('Class', null = True)

    translations = TranslatedFields(
        name = TextField(),
        description = TextField(blank = True)
        )

    def __str__(self):
        return self.name

    class Meta:
        db_table = "parameters"


class Document(models.Model):
    last_mod = DateTimeField(auto_now_add = True)
    json_data = JSONField()

    class Meta:
        db_table = "documents"


class Measurement(models.Model):
    session = ForeignKey('Session', related_name = 'measurements')
    parameter = ForeignKey('Parameter')
    channel = ForeignKey('Channel')
    channel_doc = ForeignKey('Document', related_name = 'channel_doc_id')
    parameter_doc = ForeignKey('Document', related_name = 'parameter_doc_id')
    sampling_frequency = FloatField()
    max_frequency  = FloatField()
    min_frequency  = FloatField()

    class Meta:
        db_table = "measurements"

    def instance(self, source = "parameter"):
        '''
        Create a new object of type indicated by source's klass field and relate
        it to the measurement object and the corresponding document's json
        '''
        doc = getattr(self, source + "_doc").json_data
        source_obj = getattr(self, source)
        return source_obj.klass(doc, source_obj, self) if source_obj.klass else None
