from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


def send_approval_email(academy):
    subject = "🎉 Your Academy Has Been Approved — AutoMaster"
    
    html_content = render_to_string('emails/academy_approved.html', {
        'academy_name': academy.name,
        'login_url': f"{settings.FRONTEND_URL}/signin",
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Congratulations {academy.name}! Your academy has been approved. Login at {settings.FRONTEND_URL}/signin",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[academy.user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_rejection_email(academy):
    subject = "AutoMaster — Academy Registration Update"

    html_content = render_to_string('emails/academy_rejected.html', {
        'academy_name': academy.name,
        'rejected_reason': academy.rejected_reason or 'No reason provided.',
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Dear {academy.name}, your academy registration was not approved. Reason: {academy.rejected_reason or 'No reason provided.'}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[academy.user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()

def send_trainer_approval_email(trainer):
    subject = "✅ Your Trainer Has Been Approved — AutoMaster"

    html_content = render_to_string('emails/trainer_approved.html', {
        'academy_name': trainer.academy.name,
        'trainer_name': trainer.name,
        'dashboard_url': f"{settings.FRONTEND_URL}/dashboard/trainers",
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Your trainer {trainer.name} has been approved.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[trainer.academy.user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_trainer_rejection_email(trainer):
    subject = "AutoMaster — Trainer Not Approved"

    html_content = render_to_string('emails/trainer_rejected.html', {
        'academy_name': trainer.academy.name,
        'trainer_name': trainer.name,
        'rejected_reason': trainer.rejected_reason or 'No reason provided.',
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Your trainer {trainer.name} was not approved. Reason: {trainer.rejected_reason or 'No reason provided.'}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[trainer.academy.user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_course_approval_email(course):
    subject = "✅ Your Course Has Been Approved — AutoMaster"

    html_content = render_to_string('emails/course_approved.html', {
        'academy_name': course.academy.name,
        'course_title': course.title,
        'dashboard_url': f"{settings.FRONTEND_URL}/dashboard/courses",
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Your course {course.title} has been approved.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[course.academy.user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_course_rejection_email(course):
    subject = "AutoMaster — Course Not Approved"

    html_content = render_to_string('emails/course_rejected.html', {
        'academy_name': course.academy.name,
        'course_title': course.title,
        'rejected_reason': course.rejected_reason or 'No reason provided.',
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Your course {course.title} was not approved. Reason: {course.rejected_reason or 'No reason provided.'}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[course.academy.user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()