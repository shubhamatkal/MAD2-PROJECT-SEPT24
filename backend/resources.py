from flask import jsonify, request
from flask_restful import Api, Resource, fields, marshal_with
# from flask_security import auth_required, current_user
from flask import current_app as app
from backend.models import Service, Professional, ServiceRequest, db
from backend.auth_utils import role_required

cache = app.cache


api = Api(prefix='/api')


# Define fields for marshalling output
services_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'base_price': fields.Float,
    'description': fields.String,
}

professionals_fields = {
    'id': fields.Integer,
    'full_name': fields.String,
    'user_id': fields.String,
    'experience': fields.Integer,
    'service_name': fields.String,
    'document_path': fields.String,
    'address': fields.String,
    'pincode': fields.String,
}

service_requests_fields = {
    'id': fields.Integer,
    'service_id': fields.Integer,
    'customer_id': fields.Integer,
    'professional_id': fields.Integer,
    'date_of_request': fields.DateTime,
    'date_of_completion': fields.DateTime,
    'service_status': fields.String,
    'remarks': fields.String,
}

### Services API
class ServiceAPI(Resource):

    @marshal_with(services_fields)
    # @auth_required('token')
    def get(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404
        return service

    # @auth_required('token')
    def delete(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404

        db.session.delete(service)
        db.session.commit()
        return {"message": "Service deleted"}


### List APIs (Fetching all records)
class ServiceListAPI(Resource):
    print("inside service list api")
    @marshal_with(services_fields)
    # @auth_required('token')
    # @cache.cached(timeout = 5, key_prefix = "services")
    def get(self):
        print("inside get of services")
        services = Service.query.all()
        print(services, "this is services")
        return services

    # @auth_required('token')
    def post(self):
        data = request.get_json()
        service = Service(name=data['name'], base_price=data['base_price'], description=data['description'])
        db.session.add(service)
        db.session.commit()
        return {"message": "Service created"}



# Professionals List API
class ProfessionalListAPI(Resource):

    @marshal_with(professionals_fields)
    # @auth_required('token')
    def get(self):
        professionals = Professional.query.all()
        print(professionals, "this is professionals")
        return professionals

    # @auth_required('token')
    def post(self):
        data = request.get_json()
        professional = Professional(
            name=data['full_name'],
            email=data['user_id'],
            experience=data['experience'],
            service_name=data['service_name'],
            document_path=data['document_path'],
            address=data['address'],
            pincode=data['pincode']
        )
        db.session.add(professional)
        db.session.commit()
        return {"message": "Professional created"}

# Service Requests List API
class ServiceRequestListAPI(Resource):

    @marshal_with(service_requests_fields)
    # @auth_required('token')
    def get(self):
        requests = ServiceRequest.query.all()
        return requests

    # @role_required(0)
    def post(self):
        data = request.get_json()
        service_request = ServiceRequest(
            service_id=data['service_id'],
            customer_id=data['customer_id'],
            professional_id=data['professional_id'],
            date_of_request=data['date_of_request'],
            date_of_completion=data['date_of_completion'],
            service_status=data['service_status'],
            remarks=data['remarks']
        )
        db.session.add(service_request)
        db.session.commit()
        return {"message": "Service request created"}

### Professionals API
class ProfessionalAPI(Resource):

    @marshal_with(professionals_fields)
    # @auth_required('token')
    def get(self, professional_id):
        professional = Professional.query.get(professional_id)
        if not professional:
            return {"message": "Professional not found"}, 404
        return professional

    # @auth_required('token')
    def delete(self, professional_id):
        professional = Professional.query.get(professional_id)
        if not professional:
            return {"message": "Professional not found"}, 404

        db.session.delete(professional)
        db.session.commit()
        return {"message": "Professional deleted"}

### Service Requests API
class ServiceRequestAPI(Resource):

    @marshal_with(service_requests_fields)
    # @auth_required('token')
    def get(self, request_id):
        request = ServiceRequest.query.get(request_id)
        if not request:
            return {"message": "Service request not found"}, 404
        return request

    # @auth_required('token')
    def delete(self, request_id):
        request = ServiceRequest.query.get(request_id)
        if not request:
            return {"message": "Service request not found"}, 404

        db.session.delete(request)
        db.session.commit()
        return {"message": "Service request deleted"}

# Add the new resources to the API
api.add_resource(ProfessionalAPI, '/professionals/<int:professional_id>')
api.add_resource(ProfessionalListAPI, '/professionals')
api.add_resource(ServiceRequestAPI, '/service_requests/<int:request_id>')
api.add_resource(ServiceRequestListAPI, '/service_requests')
# Add the resources to the API
api.add_resource(ServiceAPI, '/services/<int:service_id>')
api.add_resource(ServiceListAPI, '/services')