from celery import Celery
from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder, monthly_report_customer

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender: Celery, **kwargs):
	#every day at 6:55 PM
	sender.add_periodic_task(crontab(hour=18, minute=55), email_reminder.s("hello subject", "this is message", "shubham@a2z.com"), name='send email every day')
	#weekly on sunday at 6:55 PM
	sender.add_periodic_task(crontab(hour=18, minute=55, day_of_week=0), email_reminder.s("hello subject", "this is message", "shubham@a2z.com"), name='send email every sunday')
	#monthly on 1st at 6:55 PM for customers
	sender.add_periodic_task(crontab(hour=18, minute=55, day_of_month=1), monthly_report_customer.s(), name='monthly report for customers')

@celery_app.task
def test(arg):
    print(arg)

@celery_app.task
def add(x, y):
    z = x + y 
    print(z)