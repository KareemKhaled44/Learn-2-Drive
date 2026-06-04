from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


def _get_recipient_email(user):
    if not user or not getattr(user, 'email', None):
        return None
    return user.email


def send_approval_email(academy):
    recipient_email = _get_recipient_email(academy.user)
    if not recipient_email:
        return

    subject = "🎉 Your Academy Has Been Approved — Learn 2 Drive"
    
    html_content = render_to_string('emails/academy_approved.html', {
        'academy_name': academy.name,
        'login_url': f"{settings.FRONTEND_URL}/signin",
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Congratulations {academy.name}! Your academy has been approved. Login at {settings.FRONTEND_URL}/signin",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_rejection_email(academy):
    recipient_email = _get_recipient_email(academy.user)
    if not recipient_email:
        return

    subject = "Learn 2 Drive — Academy Registration Update"

    html_content = render_to_string('emails/academy_rejected.html', {
        'academy_name': academy.name,
        'rejected_reason': academy.rejected_reason or 'No reason provided.',
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Dear {academy.name}, your academy registration was not approved. Reason: {academy.rejected_reason or 'No reason provided.'}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()

def send_trainer_approval_email(trainer):
    recipient_email = _get_recipient_email(trainer.academy.user if trainer.academy else None)
    if not recipient_email:
        return

    subject = "✅ Your Trainer Has Been Approved — Learn 2 Drive"

    html_content = render_to_string('emails/trainer_approved.html', {
        'academy_name': trainer.academy.name,
        'trainer_name': trainer.name,
        'dashboard_url': f"{settings.FRONTEND_URL}/dashboard/trainers",
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Your trainer {trainer.name} has been approved.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_trainer_rejection_email(trainer):
    recipient_email = _get_recipient_email(trainer.academy.user if trainer.academy else None)
    if not recipient_email:
        return

    subject = "Learn 2 Drive — Trainer Not Approved"

    html_content = render_to_string('emails/trainer_rejected.html', {
        'academy_name': trainer.academy.name,
        'trainer_name': trainer.name,
        'rejected_reason': trainer.rejected_reason or 'No reason provided.',
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Your trainer {trainer.name} was not approved. Reason: {trainer.rejected_reason or 'No reason provided.'}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_course_approval_email(course):
    recipient_email = _get_recipient_email(course.academy.user if course.academy else None)
    if not recipient_email:
        return

    subject = "✅ Your Course Has Been Approved — Learn 2 Drive"

    html_content = render_to_string('emails/course_approved.html', {
        'academy_name': course.academy.name,
        'course_title': course.title,
        'dashboard_url': f"{settings.FRONTEND_URL}/dashboard/courses",
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Your course {course.title} has been approved.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_course_rejection_email(course):
    recipient_email = _get_recipient_email(course.academy.user if course.academy else None)
    if not recipient_email:
        return

    subject = "Learn 2 Drive — Course Not Approved"

    html_content = render_to_string('emails/course_rejected.html', {
        'academy_name': course.academy.name,
        'course_title': course.title,
        'rejected_reason': course.rejected_reason or 'No reason provided.',
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Your course {course.title} was not approved. Reason: {course.rejected_reason or 'No reason provided.'}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_booking_confirmation_email(booking):
    subject = "✅ Booking Confirmed — Learn 2 Drive"

    html_content = render_to_string('emails/booking_confirmed.html', {
        'user_name': booking.user.get_full_name() or booking.user.username,
        'course_title': booking.course.title,
        'academy_name': booking.course.academy.name if booking.course.academy else 'Learn 2 Drive Academy',
        'trainer_name': booking.trainer.name,
        'scheduled_date': booking.scheduled_date.strftime('%A, %B %d, %Y'),
        'start_time': booking.start_time.strftime('%I:%M %p'),
        'booking_id': booking.id,
        'dashboard_url': f"{settings.FRONTEND_URL}/userdashboard/bookings",
    })

    email = EmailMultiAlternatives(
        subject=subject,
        body=(
            f"Hi {booking.user.get_full_name() or booking.user.username}, your booking for "
            f"{booking.course.title} has been confirmed for {booking.scheduled_date} at {booking.start_time}."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[booking.user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=True)