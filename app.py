from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db, Admin, Customer, Professional, Service, ServiceRequest, Role
from flask_security import Security, SQLAlchemyUserDatastore, auth_required
import os
from backend.auth_utils import MultiTableUserDatastore
from backend.routes import register_routes  # Import the route registration function



app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')
app.config['UPLOAD_FOLDER'] = 'static/uploads/'  # Folder to save documents
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def createApp():
    app.config.from_object(LocalDevelopmentConfig)

    # model init
    db.init_app(app)

    # Initialize custom datastore
    datastore = MultiTableUserDatastore(db, Admin, Customer, Professional)
    app.security = Security(app, datastore=datastore, register_blueprint=False)
    with app.app_context():
        db.create_all()
        register_routes(app)  # Register routes here


    # app.app_context().push()

    return app

app = createApp()

import backend.create_initial_data


if (__name__ == '__main__'):
    app.run()