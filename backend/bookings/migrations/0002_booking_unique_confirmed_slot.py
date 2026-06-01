from django.db import migrations, models
import django.db.models.deletion
import django.db.models.functions
from django.db.models import Q


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='booking',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='booking',
            constraint=models.UniqueConstraint(
                fields=('trainer', 'scheduled_date', 'start_time'),
                condition=Q(('status', 'confirmed')),
                name='unique_confirmed_booking_slot',
            ),
        ),
    ]