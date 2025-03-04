# Generated by Django 5.1.2 on 2025-03-04 20:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('interview', '0004_candidate'),
    ]

    operations = [
        migrations.CreateModel(
            name='Capture',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='captures/')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
