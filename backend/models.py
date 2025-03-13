from flask_sqlalchemy import SQLAlchemy
from flask_security import RoleMixin
from flask_security import UserMixin, RoleMixin
db = SQLAlchemy()

# Admin Model
class Admin(UserMixin,db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False, server_default='0')
    active = db.Column(db.Boolean, default=True)
    # Adding fs_uniquifier field
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    def __repr__(self):
        return f"<Admin {self.email}>"

# Customer Model
class Customer(UserMixin,db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    pin_code = db.Column(db.String(20), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False, server_default='1')
    # Adding fs_uniquifier field
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)

    def __repr__(self):
        return f"<Customer {self.email}>"

#add is approved in this 
# Professional Model
class Professional(UserMixin,db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), unique=True, nullable=False)  # Email acts as user_id
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    service_name = db.Column(db.String(100), nullable=False)  # Dropdown choices to be handled in forms
    experience = db.Column(db.Float(precision=2), nullable=False)
    document_path = db.Column(db.String(255), nullable=True)  # Path to the uploaded document
    address = db.Column(db.String(255), nullable=False)
    pin_code = db.Column(db.String(20), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False, server_default='2')
    phone = db.Column(db.Integer, nullable=True)
    is_approved = db.Column(db.Integer, default=0)
    # Adding fs_uniquifier field
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    def __repr__(self):
        return f"<Professional {self.full_name} ({self.user_id})>"

# Role Model
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f"<Role {self.name}>"

# Service Model
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.String(50), nullable=False)  # Example: "2 hours"
    description = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<Service {self.name}>"

# Service Request Model
class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=True)
    date_of_request = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    date_of_completion = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(db.String(20), nullable=False, default='requested')  # requested, assigned, closed
    remarks = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Float, nullable=True)
    rating_remarks = db.Column(db.String(500), nullable=True)
    rated_at = db.Column(db.DateTime(timezone=True), nullable=True)

    # Relationships
    service = db.relationship('Service', backref='service_requests', lazy=True)
    customer = db.relationship('Customer', backref='service_requests', foreign_keys=[customer_id])
    professional = db.relationship('Professional', backref='service_requests', foreign_keys=[professional_id])

    def __repr__(self):
        return f"<ServiceRequest {self.id}>"