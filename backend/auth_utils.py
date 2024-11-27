from flask_security.datastore import SQLAlchemyUserDatastore
from flask_security.utils import verify_password
from backend.models import db, Admin, Customer, Professional

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

        # Search in Professional table
        user = db.session.query(Professional).filter_by(**kwargs).first()
        return user

# Custom function to verify user password
def custom_verify_password(email, password):
    datastore = MultiTableUserDatastore(db, Admin, Customer, Professional)  # Role not needed for verification
    user = datastore.find_user_(email=email)
    print(user, "this is nside user with valid email")
    print(user.password, "this is user password")
    check = verify_password(password, user.password)
    print(check, "this is check")
    if user and verify_password(password, user.password):
        return user
    return None

def find_user(email):
    # Search in Admin table
    user = db.session.query(Admin).filter_by(email=email).first()
    if user:
        return user

    # Search in Customer table
    user = db.session.query(Customer).filter_by(email=email).first()
    if user:
        return user

    # Search in Professional table
    user = db.session.query(Professional).filter_by(email=email).first()
    return user
