from celery import Celery
from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import  monthly_report_customer, send_professional_daily_task_notifications

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender: Celery, **kwargs):
	#daily at 7:00 AM for professionals
	sender.add_periodic_task(crontab(hour=7, minute=0), send_professional_daily_task_notifications.s(), name='send daily task notifications to professionals')
	#monthly to customers on last day of month at 7:00 PM
	sender.add_periodic_task(crontab(hour=19, minute=0, day_of_month=28), monthly_report_customer.s(), name='monthly report for customers')

	# #every minute test	comment this out
	# sender.add_periodic_task(crontab(minute='*'), send_professional_daily_task_notifications.s(), name='test send daily task notifications to professionals')
	# sender.add_periodic_task(crontab(minute='*'), monthly_report_customer.s(), name='test monthly report for customers')