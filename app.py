from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db, Admin, Customer, Professional, Service, ServiceRequest
from flask_security import Security
from flask_caching import Cache
import os
from backend.auth_utils import MultiTableUserDatastore
from backend.routes import register_routes  # Import the route registration function
from backend.celery.celery_factory import celery_init_app
import flask_excel as excel

def createApp():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')
    app.config.from_object(LocalDevelopmentConfig)

    # Ensure the upload folder exists
    app.config['UPLOAD_FOLDER'] = 'static/uploads/'
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize models and cache
    db.init_app(app)
    cache = Cache(app)
    app.cache = cache


    # Initialize Flask-Security with a custom datastore
    datastore = MultiTableUserDatastore(db, Admin, Customer, Professional)
    app.security = Security(app, datastore=datastore, register_blueprint=False)

    # Push the application context here
    app.app_context().push()

    # Import and initialize the API (now that context is available)
    from backend.resources import api
    api.init_app(app)

    # Create database tables and register routes
    with app.app_context():
        db.create_all()
        register_routes(app)

    return app

app = createApp()

celery_app = celery_init_app(app)

# Import any necessary initialization code
import backend.create_initial_data
excel.init_excel(app)
if __name__ == '__main__':
    app.run()
