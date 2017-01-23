# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-10-17 21:15
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import jsonfield.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Channels',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='Devices',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='Documents',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_mod', models.DateTimeField(auto_now_add=True)),
                ('json_data', jsonfield.fields.JSONField()),
            ],
        ),
        migrations.CreateModel(
            name='Functions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('django_func', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Measurements',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sampling_frequency', models.FloatField()),
                ('max_frequency', models.FloatField()),
                ('min_frequency', models.FloatField()),
                ('channel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend_api.Channels')),
                ('chn_doc_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chn_doc_id', to='backend_api.Documents')),
                ('par_doc_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='par_doc_id', to='backend_api.Documents')),
            ],
        ),
        migrations.CreateModel(
            name='Parameters',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('conversion_params', models.TextField()),
                ('channel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend_api.Channels')),
                ('conversion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='par_conv', to='backend_api.Functions')),
            ],
        ),
        migrations.CreateModel(
            name='Sessions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('time_begin', models.DateTimeField()),
                ('time_end', models.DateTimeField()),
                ('orbit_code', models.IntegerField(null=True)),
                ('geo_line', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Space_projects',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_start', models.DateField()),
                ('date_end', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='Translations',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('langcode', models.CharField(max_length=2)),
                ('text', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Units',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('long_name', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='u_lname', to='backend_api.Translations')),
                ('short_name', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='u_sname', to='backend_api.Translations')),
            ],
        ),
        migrations.CreateModel(
            name='Values',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('short_name', models.CharField(max_length=100)),
                ('description', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='val_description', to='backend_api.Translations')),
                ('name', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='val_name', to='backend_api.Translations')),
                ('units', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend_api.Units')),
            ],
        ),
        migrations.AddField(
            model_name='space_projects',
            name='description',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sp_descrioption', to='backend_api.Translations'),
        ),
        migrations.AddField(
            model_name='space_projects',
            name='name',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sp_name', to='backend_api.Translations', unique=True),
        ),
        migrations.AddField(
            model_name='parameters',
            name='description',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='par_description', to='backend_api.Translations'),
        ),
        migrations.AddField(
            model_name='parameters',
            name='name',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='par_name', to='backend_api.Translations'),
        ),
        migrations.AddField(
            model_name='parameters',
            name='quicklook',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='par_ql', to='backend_api.Functions'),
        ),
        migrations.AddField(
            model_name='parameters',
            name='value',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend_api.Values'),
        ),
        migrations.AddField(
            model_name='measurements',
            name='parameter',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend_api.Parameters'),
        ),
        migrations.AddField(
            model_name='measurements',
            name='session',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend_api.Sessions'),
        ),
        migrations.AddField(
            model_name='functions',
            name='description',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='func_description', to='backend_api.Translations'),
        ),
        migrations.AddField(
            model_name='devices',
            name='description',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dev_description', to='backend_api.Translations'),
        ),
        migrations.AddField(
            model_name='devices',
            name='name',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dev_name', to='backend_api.Translations'),
        ),
        migrations.AddField(
            model_name='devices',
            name='satellite',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend_api.Space_projects'),
        ),
        migrations.AddField(
            model_name='channels',
            name='description',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ch_description', to='backend_api.Translations'),
        ),
        migrations.AddField(
            model_name='channels',
            name='device',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend_api.Devices'),
        ),
        migrations.AddField(
            model_name='channels',
            name='name',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ch_name', to='backend_api.Translations'),
        ),
        migrations.AddField(
            model_name='channels',
            name='quicklook',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend_api.Functions'),
        ),
    ]
