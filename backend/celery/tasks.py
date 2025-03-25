from celery import shared_task
import time
from backend.models import Service, Professional, Customer, ServiceRequest
import flask_excel
from backend.celery.mail_service import send_email, monthly_report_customer_, send_professional_daily_task_notifications_
import os 
from datetime import datetime
import pandas as pd

@shared_task(ignore_result=False)
def add(x, y):
	time.sleep(10)
	return x + y


@shared_task(bind=True, ignore_result=False)
def backup_database_tables(self):
    """ 
    Create a single CSV backup containing data from multiple database tables
    Returns: 
    - Generated backup file name 
    """
    # Ensure backup directory exists
    backup_dir = './backend/celery/db-backups'
    os.makedirs(backup_dir, exist_ok=True)

    # Define tables to backup with their names
    tables_to_backup = [
        (Service, 'service'), 
        (Professional, 'professional'), 
        (Customer, 'customer'), 
        (ServiceRequest, 'service_request')
    ]

    # Task ID and timestamp for unique identification
    task_id = self.request.id
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Filename for the consolidated backup
    file_name = f'backup_consolidated_{timestamp}_{task_id}.csv'
    full_path = os.path.join(backup_dir, file_name)

    # Prepare consolidated data
    consolidated_data = []

    # Collect data from each table
    for model, table_name in tables_to_backup:
        # Get all records
        records = model.query.all()
        
        # Convert records to dictionaries and add table name
        for record in records:
            record_dict = record.__dict__.copy()
            # Remove SQLAlchemy internal attributes
            record_dict.pop('_sa_instance_state', None)
            # Add table name to identify the source
            record_dict['source_table'] = table_name
            consolidated_data.append(record_dict)

    # Write to a single CSV file
    if consolidated_data:
        # Use pandas to write CSV with all data
        import pandas as pd
        df = pd.DataFrame(consolidated_data)
        df.to_csv(full_path, index=False)

    return file_name

@shared_task(ignore_result = True)
def monthly_report_customer():
	monthly_report_customer_()

@shared_task(ignore_result = True)
def send_professional_daily_task_notifications():
	send_professional_daily_task_notifications_()

