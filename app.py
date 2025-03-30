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

from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from functools import wraps
from datetime import datetime, timedelta
from flask import jsonify



from flask_security.datastore import SQLAlchemyUserDatastore


class MultiTableUserDatastore(SQLAlchemyUserDatastore):
    def __init__(self, db, *user_models):
        self.db = db
        self.user_models = user_models

    def find_user(self, **kwargs):
        for model in self.user_models:
            user = self.db.session.query(model).filter_by(**kwargs).first()
            if user:
                return user
        return None

# In your app initialization
datastore = MultiTableUserDatastore(
    db, 
    Admin,      # First model
    Customer,   # Second model
    Professional  # Third model
)




def createApp():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend')
    app.config.from_object(LocalDevelopmentConfig)

    # Ensure the upload folder exists
    app.config['UPLOAD_FOLDER'] = 'static/uploads/'
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize models and cache
    db.init_app(app)
    cache = Cache(app)
    app.cache = cache


    # Initialize Flask-Security with a custom datastore
    # datastore = MultiTableUserDatastore(db, Admin, Customer, Professional)
    app.security = Security(app, datastore=datastore, register_blueprint=False)

    # Initialize JWT
    app.config["JWT_SECRET_KEY"] = "shubhamatkal"  # Change this to a strong secret key
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    jwt = JWTManager(app)

    # Somewhere in your app initialization
    # app.config['JWT_SECRET_KEY'] = 'your-secret-key'
    # jwt = JWTManager(app)

    # Add a JWT error handler to see what's happening
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        print(f"INVALID TOKEN ERROR: {error_string}")
        return jsonify({
            'message': f'Invalid token: {error_string}',
            'error': 'invalid_token'
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print("EXPIRED TOKEN ERROR")
        return jsonify({
            'message': 'Token has expired',
            'error': 'expired_token'
        }), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error_string):
        print(f"UNAUTHORIZED ERROR: {error_string}")
        return jsonify({
            'message': f'Missing token: {error_string}',
            'error': 'unauthorized'
        }), 401

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
import backend.routes
import backend.celery.celery_schedule
#also add here celery code

excel.init_excel(app)
if __name__ == '__main__':
    app.run()
