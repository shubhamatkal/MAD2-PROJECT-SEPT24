from celery import shared_task
import time
from backend.models import Service
import flask_excel


@shared_task(ignore_result=False)
def add(x, y):
	time.sleep(10)
	return x + y

@shared_task(ignore_result = True)
def create_csv():
	srvice = Service.query.all()
	col_names = [column.name for column in Service.__table__.columns]
	csv_out = flask_excel.make_response_from_query_sets(srvice,column_names = col_names, file_type='csv')

	with open('./backend/celery/user-downloads/service.csv', 'wb') as file:
		file.write(csv_out.data)
	return 'service.csv'


