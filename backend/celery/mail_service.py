import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.models import Customer, ServiceRequest, Professional
from datetime import datetime, timedelta
from sqlalchemy import func
from datetime import datetime, timedelta
from sqlalchemy import or_
from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

SMTP_SERVER = 'localhost'
SMTP_PORT = 1025
SENDER_EMAIL = 'admin@a2z.com'
SENDER_PASSWORD = 'admin123'

def send_email(subject, message, to_email):
	msg = MIMEMultipart()
	msg['From'] = SENDER_EMAIL
	msg['To'] = to_email
	msg['Subject'] = subject
	msg.attach(MIMEText(message, 'html'))

	with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as client:
		client.send_message(msg)
		client.quit()

def monthly_report_customer_():
    """
    Send monthly activity summary emails to all active customers.
    Retrieves customer service request information for the past month
    and generates personalized email reports.
    """
    # # Get the start and end of the previous month
    today = datetime.now()
    # First day of the "previous month" (i.e., this month's first day)
    first_day_of_previous_month = today.replace(day=1)
    # Last day of the "previous month" (i.e., today)
    last_day_of_previous_month = today

    # Fetch all active customers
    all_customers = Customer.query.filter_by(is_active=True).all()

    for customer in all_customers:
        # Retrieve service requests for the customer in the previous month
        customer_requests = ServiceRequest.query.filter(
            ServiceRequest.customer_id == customer.id,
            ServiceRequest.date_of_request >= first_day_of_previous_month,
            ServiceRequest.date_of_request <= last_day_of_previous_month
        ).all()

        # Prepare email content
        email_subject = f"A2Z Household Services - Your Monthly Service Summary for {last_day_of_previous_month.strftime('%B %Y')}"
        
        # Generate email body
        email_body = f"""
        <html>
        <body>
            <h2>Dear {customer.full_name},</h2>
            
            <p>Thank you for being a valued customer of A2Z Household Services. Here's a summary of your service activities for {last_day_of_previous_month.strftime('%B %Y')}:</p>
            
            {'<h3>Service Requests</h3>' if customer_requests else '<p>You did not have any service requests this month.</p>'}
            
            {''.join([f"""
            <div style='margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;'>
                <p><strong>Service Request #{req.id}</strong></p>
                <ul>
                    <li>Date of Request: {req.date_of_request.strftime('%d %B %Y')}</li>
                    <li>Service Status: {req.service_status}</li>
                    {'<li>Completion Date: ' + req.date_of_completion.strftime('%d %B %Y') + '</li>' if req.date_of_completion else ''}
                    {'<li>Rating: ' + str(req.rating) + '/5' if req.rating else ''}
                </ul>
            </div>
            """ for req in customer_requests])}
            
            <p>We appreciate your trust in A2Z Household Services. If you have any questions or feedback, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>A2Z Household Services Team</p>
        </body>
        </html>
        """
        
        # Send personalized email
        try:
            send_email(email_subject, email_body, customer.email)
            print(f"Email sent successfully to {customer.email}")
        except Exception as e:
            print(f"Failed to send email to {customer.email}. Error: {str(e)}")

    return f"Monthly report emails sent to {len(all_customers)} customers."

def send_professional_daily_task_notifications_():
    """
    Send daily task notifications to professionals 
    highlighting their new and pending service requests.
    """

    print("Sending daily task notifications to professionals...")
    # Get today's date
    today = datetime.now()

    try:
        # Fetch approved professionals with their service requests in a single query
        professionals = (
            Professional.query
            .filter_by(is_approved=1)
            .options(
                joinedload(Professional.service_requests)
                .joinedload(ServiceRequest.service)
            )
            .all()
        )
        print(f"Found {len(professionals)} active professionals.")
        # Track total emails sent
        emails_sent = 0

        for professional in professionals:

            # Retrieve service requests for this professional with specific statuses
            service_requests = ServiceRequest.query.filter(
                ServiceRequest.professional_id == professional.id,
                ServiceRequest.service_status.in_(['requested', 'rssigned', 'pending'])
            ).all()

            print(f"Found {len(service_requests)} relevant tasks for {professional.full_name}.")
            # Skip if no relevant tasks
            if not service_requests:
                continue

            # Categorize service requests
            new_requests = [
                req for req in service_requests 
                if req.service_status == 'requested'
            ]
            assigned_requests = [
                req for req in service_requests 
                if req.service_status == 'assigned'
            ]
            pending_requests = [
                req for req in service_requests 
                if req.service_status == 'pending'
            ]

            # Prepare email content
            email_subject = f"A2Z Household Services - Daily Task Notification ({today.strftime('%d %B %Y')})"
            
            email_body = f"""
            <html>
            <body>
                <h2>Dear {professional.full_name},</h2>
                
                <p>Here's your daily task summary for {today.strftime('%d %B %Y')}:</p>
                
                {'<h3>New Service Requests</h3><ul>' + ''.join([f'<li>Request #{req.id} - {req.service.name} (Requested on {req.date_of_request.strftime("%d %B %Y")})</li>' for req in new_requests]) + '</ul>' if new_requests else ''}
                
                {'<h3>Assigned Tasks</h3><ul>' + ''.join([f'<li>Request #{req.id} - {req.service.name} (Assigned on {req.date_of_request.strftime("%d %B %Y")})</li>' for req in assigned_requests]) + '</ul>' if assigned_requests else ''}
                
                {'<h3>Pending Tasks</h3><ul>' + ''.join([f'<li>Request #{req.id} - {req.service.name} (Pending since {req.date_of_request.strftime("%d %B %Y")})</li>' for req in pending_requests]) + '</ul>' if pending_requests else ''}
                
                <p>Action Required:</p>
                <ul>
                    <li>Review and accept new service requests</li>
                    <li>Complete assigned and pending tasks</li>
                    <li>Update task status in your professional dashboard</li>
                </ul>
                
                <p>Need help? Contact our support team.</p>
                
                <p>Best regards,<br>A2Z Household Services Team</p>
            </body>
            </html>
            """
            
            # Send personalized email
            try:
                # Validate email before sending
                if not professional.user_id or '@' not in professional.user_id:
                    print(f"Invalid email for {professional.full_name}. Skipping.")
                    continue

                send_email(email_subject, email_body, professional.user_id)
                emails_sent += 1
                print(f"Task notification email sent successfully to {professional.full_name}")
            except Exception as e:
                print(f"Failed to send task notification email to {professional.full_name}. Error: {str(e)}")

        return f"Daily task notifications sent to {emails_sent} professionals with pending tasks."

    except Exception as e:
        # Comprehensive error logging
        print(f"Critical error in send_professional_daily_task_notifications: {str(e)}")
        # Log the full traceback for debugging
        import traceback
        traceback.print_exc()
        
        # Re-raise the exception for Celery to handle
        raise


