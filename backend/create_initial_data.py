from werkzeug.security import generate_password_hash  # For hashing passwords
from app import app, db  # Ensure you import your app and db objects
from backend.models import Admin, Role  # Import the models you need to create
import uuid

with app.app_context():
    # Create all tables if not already created
    db.create_all()

    # Create roles if they don't exist
    roles = [
        {"id": 0, "name": "admin", "description": "Administrator with all privileges"},
        {"id": 1, "name": "customer", "description": "Regular customer"},
        {"id": 2, "name": "professional", "description": "Service professional"},
    ]

    for role_data in roles:
        role = Role.query.get(role_data["id"])
        if not role:
            new_role = Role(id=role_data["id"], name=role_data["name"], description=role_data["description"])
            db.session.add(new_role)

    # Create default admin if not already present
    admin_email = "shubham@mail.com"
    admin_password = "admin"  # Use a strong password in production
    existing_admin = Admin.query.filter_by(email=admin_email).first()

    if not existing_admin:
        hashed_password = generate_password_hash(admin_password)
        new_admin = Admin(email=admin_email, password=hashed_password, full_name="Shubham Admin", role_id=0,fs_uniquifier=str(uuid.uuid4()))
        db.session.add(new_admin)

    # Commit all changes to the database
    db.session.commit()
