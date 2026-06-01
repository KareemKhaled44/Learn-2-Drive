# availability.py
from datetime import datetime, timedelta
from .models import Booking


def get_available_slots(trainer, date, course):
    #Returns a list of available time slots for a trainer on a given date.

    # 1 - check if the date is a working day for the trainer
    day_name = date.strftime('%A').lower() 
    if day_name not in trainer.working_days:
        return []

    # 2 - check trainer has a schedule set
    if not trainer.session_start_time or not trainer.session_end_time:
        return []

    # 3 - generate all possible slots based on course duration
    slots = []
    session_duration = timedelta(minutes=course.duration)

    current_time = datetime.combine(date, trainer.session_start_time)
    end_time = datetime.combine(date, trainer.session_end_time)

    while current_time + session_duration <= end_time:
        slots.append(current_time.time())
        current_time += session_duration

    # 4 - get already booked slots for this trainer on this date
    booked_times = Booking.objects.filter(
        trainer=trainer,
        scheduled_date=date,
        status='confirmed'
    ).values_list('start_time', flat=True)

    # 5 - return slots with availability status
    return [
        {
            "time": slot.strftime('%H:%M'),
            "available": slot not in booked_times
        }
        for slot in slots
    ]