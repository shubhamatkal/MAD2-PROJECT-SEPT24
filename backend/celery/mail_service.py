import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


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

def monthly_report_customer():
	#write script to loop over all customers and send data like monthly how many services 
	#they have requested and all how many are open and how many are closed

# send_email('Hello', 'Hello, World!', 'shubham@customer.com')