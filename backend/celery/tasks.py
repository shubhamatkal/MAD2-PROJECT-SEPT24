from celery import shared_task
import time
from backend.models import Service
import flask_excel


@shared_task(ignore_result=False)
def add(x, y):
	time.sleep(10)
	return x + y

@shared_task(bind = True, ignore_result = False)
def create_csv(self):
	task_id = self.request.id
	file_name = f'service_data_{task_id}.csv'
	srvice = Service.query.all()
	col_names = [column.name for column in Service.__table__.columns]
	csv_out = flask_excel.make_response_from_query_sets(srvice,column_names = col_names, file_type='csv')

	with open(f'./backend/celery/user-downloads/{file_name}', 'wb') as file:
		file.write(csv_out.data)
	return file_name


