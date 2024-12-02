from flask import jsonify, request
from flask_restful import Api, Resource, fields, marshal_with
# from flask_security import auth_required, current_user
from flask import current_app as app
from backend.models import Service, Professional, ServiceRequest, db, Customer
from backend.auth_utils import role_required
from flask_restful import reqparse


cache = app.cache


api = Api(prefix='/api')


# Define fields for marshalling output
services_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'price': fields.Float,
    'time_required': fields.String,
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
    'is_approved': fields.Integer,
}

service_requests_fields = {
    'id': fields.Integer,
    'service_name': fields.String,
    'customer_name': fields.String,
    'professional_name': fields.String,
    'date_of_request': fields.DateTime,
    'date_of_completion': fields.DateTime,
    'service_status': fields.String,
    'remarks': fields.String,
}

### Services API
class ServiceAPI(Resource):
    # @marshal_with(services_fields)
    def put(self, service_id):
    # Update existing service
    # if not current_user.is_admin:
    #     return {"message": "Unauthorized"}, 403
    
        service = Service.query.get_or_404(service_id)
        
        data = request.json
        
        try:
            service.name = data['name']
            service.price = data['base_price']
            service.time_required = data['time_required']
            service.description = data['description']
            
            db.session.commit()
            
            return {
                "id": service.id,
                "name": service.name,
                "base_price": service.price,
                "time_required": service.time_required,
                "description": service.description
            }, 200
        
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    # @login_required
    # @marshal_with(services_fields)
    def delete(self, service_id):
        # Delete service
        # if not current_user.is_admin:
        #     return {"message": "Unauthorized"}, 403
        
        service = Service.query.get_or_404(service_id)
        
        try:
            db.session.delete(service)
            db.session.commit()
            return {"message": "Service deleted successfully"}, 200
        
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500



    # # @auth_required('token')
    # def get(self, service_id):
    #     service = Service.query.get(service_id)
    #     if not service:
    #         return {"message": "Service not found"}, 404
    #     return service

    # # @auth_required('token')
    # def delete(self, service_id):
    #     service = Service.query.get(service_id)
    #     if not service:
    #         return {"message": "Service not found"}, 404

    #     db.session.delete(service)
    #     db.session.commit()
    #     return {"message": "Service deleted"}


### List APIs (Fetching all records)
class ServiceListAPI(Resource):
    print("inside service list api")
    @marshal_with(services_fields)
    # @auth_required('token')
    # @cache.cached(timeout = 5, key_prefix = "services")
    def get(self):
        print("inside get of services")
        services = Service.query.all()
        print("======")
        print(type(services), "this is type of services")
        print(services, "this is services")
        for service in services:
            print(service)
            print(service.name)
            print(service.price)
            print(service.time_required)
            print(service.description)
        return services

    # @auth_required('token')
    def post(self):
        print("inside post of services")
        data = request.json
        print(data, "this is data")
        # Validate input
        if not all(key in data for key in ['name', 'base_price', 'time_required', 'description']):
            return jsonify({"message": "Missing required fields"}), 400
        print("No missing fields")
        try:
            # Create new service
            new_service = Service(
                name=data['name'],
                price=data['base_price'],
                time_required=data['time_required'],
                description=data['description']
            )
            
            # Add to database
            db.session.add(new_service)
            db.session.commit()
            
            # Return the newly created service
            return {
                "id": new_service.id,
                "name": new_service.name,
                "base_price": new_service.price,  # Make sure this matches your model's attribute
                "time_required": new_service.time_required,
                "description": new_service.description
            }, 201

        
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error creating service", "error": str(e)}), 500


        # data = request.get_json()
        # service = Service(name=data['name'], base_price=data['base_price'], description=data['description'])
        # db.session.add(service)
        # db.session.commit()
        # return {"message": "Service created"}



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
    def get(self):
        # Get all service requests
        # if not current_user.is_admin:
        #     return {"message": "Unauthorized"}, 403
        
        service_requests = ServiceRequest.query.order_by(ServiceRequest.date_of_request.desc()).all()
        
        enriched_service_requests = []
        for request in service_requests:
            customer_name = Customer.query.filter_by(id=request.customer_id).first().full_name
            professional_name = Professional.query.filter_by(id=request.professional_id).first().full_name
            service_name = Service.query.filter_by(id=request.service_id).first().name
            enriched_service_requests.append({
            'id': request.id,
            'customer_name': customer_name,
            'professional_name': professional_name,
            'service_name': service_name,
            'date_of_request': request.date_of_request,
            'date_of_completion': request.date_of_completion,
            'service_status': request.service_status,
            'remarks': request.remarks
            # Add any other fields you need
            })


        return enriched_service_requests

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

    def patch(self, professional_id):
        # Retrieve the professional
        professional = Professional.query.get_or_404(professional_id)
        
        # Parse the incoming data
        parser = reqparse.RequestParser()
        parser.add_argument('is_approved', type=int, required=True, 
                             help='Approval status is required', 
                             choices=[-1, 0, 1])
        
        try:
            # Parse and validate the arguments
            args = parser.parse_args()
            
            # Update the professional's approval status
            professional.is_approved = args['is_approved']
            
            # Commit the changes
            db.session.commit()
            
            return {"message": "Professional status updated successfully"}, 200
        
        except Exception as e:
            # Rollback in case of any error
            db.session.rollback()
            return {"message": str(e)}, 500

    def delete(self, professional_id):
        # if not current_user.is_admin:
        #     return {"message": "Unauthorized"}, 403
        
        professional = Professional.query.get_or_404(professional_id)
        
        try:
            db.session.delete(professional)
            db.session.commit()
            return {"message": "Professional deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


# ### Professionals API
# class ProfessionalAPI(Resource):

#     @marshal_with(professionals_fields)
#     # @auth_required('token')
#     def get(self, professional_id):
#         professional = Professional.query.get(professional_id)
#         if not professional:
#             return {"message": "Professional not found"}, 404
#         return professional

#     def delete(self, professional_id):
#         # if not current_user.is_admin:
#         #     return {"message": "Unauthorized"}, 403
        
#         professional = Professional.query.get_or_404(professional_id)
        
#         try:
#             db.session.delete(professional)
#             db.session.commit()
#             return {"message": "Professional deleted successfully"}, 200
#         except Exception as e:
#             db.session.rollback()
#             return {"message": str(e)}, 500

    

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