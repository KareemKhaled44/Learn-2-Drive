# academy/signals.py
from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Academy
from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Academy, Trainer, Course
from authentication.emails import (
    send_approval_email,
    send_rejection_email,
    send_trainer_approval_email,
    send_trainer_rejection_email,
    send_course_approval_email,
    send_course_rejection_email,
)
from django.utils import timezone


@receiver(pre_save, sender=Academy)
def academy_status_changed(sender, instance, **kwargs):
    # get the old status from the database
    try:
        old = Academy.objects.get(pk=instance.pk)
    except Academy.DoesNotExist:
        return  # new object, not an update

    # only send email if status actually changed
    if old.status == instance.status:
        return

    if instance.status == 'approved':
        send_approval_email(instance)

    elif instance.status == 'rejected':
        send_rejection_email(instance)


@receiver(pre_save, sender=Academy)
def academy_status_changed(sender, instance, **kwargs):
    try:
        old = Academy.objects.get(pk=instance.pk)
    except Academy.DoesNotExist:
        return

    if old.status == instance.status:
        return

    if instance.status == 'approved':
        instance.approved_at = timezone.now()
        send_approval_email(instance)
    elif instance.status == 'rejected':
        send_rejection_email(instance)


@receiver(pre_save, sender=Trainer)
def trainer_status_changed(sender, instance, **kwargs):
    try:
        old = Trainer.objects.get(pk=instance.pk)
    except Trainer.DoesNotExist:
        return

    if old.status == instance.status:
        return

    if instance.status == 'approved':
        instance.approved_at = timezone.now()
        send_trainer_approval_email(instance)
    elif instance.status == 'rejected':
        send_trainer_rejection_email(instance)


@receiver(pre_save, sender=Course)
def course_status_changed(sender, instance, **kwargs):
    try:
        old = Course.objects.get(pk=instance.pk)
    except Course.DoesNotExist:
        return

    if old.status == instance.status:
        return

    if instance.status == 'approved':
        instance.approved_at = timezone.now()
        send_course_approval_email(instance)
    elif instance.status == 'rejected':
        send_course_rejection_email(instance)