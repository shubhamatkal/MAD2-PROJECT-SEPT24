from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db, Admin, Customer, Professional, Service, ServiceRequest, Role
from flask_security import Security, SQLAlchemyUserDatastore, auth_required
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads/'  # Folder to save documents
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def createApp():

    app.config.from_object(LocalDevelopmentConfig)

    # model init
    db.init_app(app)

	# Corrected initialization of SQLAlchemyUserDatastore
    datastore = SQLAlchemyUserDatastore(db, Admin, Role)  # Only Admin and Role are required for this part

    app.security = Security(app, datastore=datastore)
    app.app_context().push()

    return app

app = createApp()

import backend.create_initial_data

@app.get('/')
def home():
    return '<h1> home page</h1>'



if (__name__ == '__main__'):
    app.run()