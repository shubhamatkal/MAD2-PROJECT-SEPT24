from flask_security.datastore import SQLAlchemyUserDatastore
from flask_security.utils import verify_password
from backend.models import db, Admin, Customer, Professional
from functools import wraps
from flask import abort
from flask_security import auth_required  #, current_user
from flask import current_app
import jwt
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta  # Import datetime properly

from flask_jwt_extended import get_jwt_identity

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Convert allowed_roles to a list if it's not already a collection type
            roles = allowed_roles
            if not isinstance(roles, (list, set, tuple)):
                roles = [roles]  # Convert to a list
                
            print(roles, "passed roles")
            
            # Get the JWT token from the request header
            token = None
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            
            if not token:
                return jsonify({"message": "Token is missing!"}), 401
            
            try:
                # Decode the token using the same secret key
                payload = jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
                
                # Access the role directly from the payload based on your JWT structure
                user_role = payload.get('role')
                print(user_role, "this is current user role")
                print(roles, "this is allowed roles")
                
                if user_role not in roles:
                    return jsonify({"message": "Access Denied!"}), 403
                
                # You can set the user in g for access in the route function if needed
                # g.user = payload
                
                return f(*args, **kwargs)
            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Token has expired!"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"message": "Invalid token!"}), 401
                
        return decorated_function
    return decorator


def generate_token(user):
    payload = {
        'sub': str(user.id), 
        'id': user.id,
        'role': user.role_id,  # Adjust based on your role field
        'exp': datetime.utcnow() + timedelta(hours=1)  # ✅ Corrected datetime usage
    }
    # secret_key = current_app.config["JWT_SECRET_KEY"]  # ✅ Access SECRET_KEY from app config
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")




# Custom datastore to search across multiple tables
class MultiTableUserDatastore(SQLAlchemyUserDatastore):
    def find_user_(self, **kwargs):
        # Search in Admin table
        user = db.session.query(Admin).filter_by(**kwargs).first()
        if user:
            return user

        # Search in Customer table
        user = db.session.query(Customer).filter_by(**kwargs).first()
        if user:
            return user

        # Search in Professional table using user_id
        if 'email' in kwargs:
            user = db.session.query(Professional).filter_by(user_id=kwargs['email']).first()
            return user

# Custom function to verify user password
def custom_verify_password(email, password):
    datastore = MultiTableUserDatastore(db, Admin, Customer, Professional)  # Role not needed for verification
    user = datastore.find_user_(email=email)
    if user == None:
        return None
    print(user, "this is nside user with valid email")
    print(user.password, "this is user password")
    check = verify_password(password, user.password)
    print(check, "this is check")
    if user and verify_password(password, user.password):
        return user
    return None

def find_user(email):
    print("inside find user")
    # Search in Admin table
    user = db.session.query(Admin).filter_by(email=email).first()
    if user:
        return user

    # Search in Customer table
    user = db.session.query(Customer).filter_by(email=email).first()
    if user:
        return user

    # Search in Professional table
    user = db.session.query(Professional).filter_by(user_id=email).first()
    return user



