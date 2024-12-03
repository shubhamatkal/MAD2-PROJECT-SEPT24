from flask import jsonify, request
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, current_user
from flask import current_app as app
from backend.models import Service, Professional, ServiceRequest, db, Customer
# from backend.auth_utils import role_required
from flask_restful import reqparse
import datetime
from datetime import timezone, datetime

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
    #@auth_required('token')
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



    # # #@auth_required('token')
    # def get(self, service_id):
    #     service = Service.query.get(service_id)
    #     if not service:
    #         return {"message": "Service not found"}, 404
    #     return service

    # # #@auth_required('token')
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

    #@auth_required('token')
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
    # #@auth_required('token')
    def get(self):
        professionals = Professional.query.all()
        print(professionals, "this is professionals")
        return professionals

    ##@auth_required('token')
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
    # ##@auth_required('token')
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
    ##@auth_required('token')
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
    ##@auth_required('token')
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
#     # ##@auth_required('token')
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
    ##@auth_required('token')
    def get(self, request_id):
        request = ServiceRequest.query.get(request_id)
        if not request:
            return {"message": "Service request not found"}, 404
        return request

    ##@auth_required('token')
    def delete(self, request_id):
        request = ServiceRequest.query.get(request_id)
        if not request:
            return {"message": "Service request not found"}, 404

        db.session.delete(request)
        db.session.commit()
        return {"message": "Service request deleted"}


class ProfessionalServiceRequestsResource(Resource):
    def get(self, professional_id):
        """
        Retrieve all service requests for a specific professional 
        with detailed customer and service information.
        
        :param professional_id: ID of the professional
        :return: JSON response with service request details
        """
        print("inside professional service requests resource")
        try:
            # Query service requests with joined customer and service information
            service_requests = (
                db.session.query(
                    ServiceRequest, 
                    Customer.full_name.label('customer_name'), 
                    Customer.address.label('customer_address'),
                    Customer.pin_code.label('customer_pincode'), 
                    Service.name.label('service_name')
                )
                .join(Customer, ServiceRequest.customer_id == Customer.id)
                .join(Service, ServiceRequest.service_id == Service.id)
                .filter(ServiceRequest.professional_id == professional_id)
                .all()
            )
            print("completed till this ")
            # Prepare the response data
            results = []
            for (service_request, customer_name, customer_address, customer_pincode, service_name) in service_requests:
                results.append({
                    # ServiceRequest model fields
                    'id': service_request.id,
                    'service_id': service_request.service_id,
                    'customer_id': service_request.customer_id,
                    'professional_id': service_request.professional_id,
                    'date_of_request': service_request.date_of_request.isoformat() if service_request.date_of_request else None,
                    'date_of_completion': service_request.date_of_completion.isoformat() if service_request.date_of_completion else None,
                    'service_status': service_request.service_status,
                    'remarks': service_request.remarks,
                    
                    # Additional customer and service details
                    'customer_name': customer_name,
                    'customer_address': customer_address,
                    'customer_pincode': customer_pincode,
                    'service_name': service_name
                })
            print(results)
            return jsonify(results)

        except Exception as e:
            print("error")
            # Error handling
            db.session.rollback()
            return {
                'message': 'An error occurred while fetching service requests',
                'error': str(e)
            }, 500
    def put(self, request_id):
        print("inside put")
        """
        Update the status of a service request
        
        :param request_id: ID of the service request to update
        :return: Updated service request details or error message
        """
        try:
            # Get the service request from the database
            service_request = ServiceRequest.query.get_or_404(request_id)
            
            # Get data from the request
            data = request.get_json()
            
            # Validate and update status
            new_status = data.get('service_status')
            if not new_status:
                return {'message': 'Status is required'}, 400
            
            # Update status
            service_request.service_status = new_status
            
            # If closed or completed, set completion date
            if new_status.lower() in ['closed', 'completed', 'rejected']:
                service_request.date_of_completion = datetime.utcnow()
            
            # Commit changes
            db.session.commit()
            
            # Prepare response
            return {
                'message': 'Service request updated successfully',
                'service_request': {
                    'id': service_request.id,
                    'service_status': service_request.service_status,
                    'date_of_completion': service_request.date_of_completion.isoformat() if service_request.date_of_completion else None
                }
            }, 200
        
        except Exception as e:
            # Rollback in case of error
            db.session.rollback()
            return {
                'message': 'An error occurred while updating the service request',
                'error': str(e)
            }, 500

class ProfessionalServiceRequestsResourcePut(Resource):
    def put(self, request_id):
        print("inside put")
        """
        Update the status of a service request
        
        :param request_id: ID of the service request to update
        :return: Updated service request details or error message
        """
        try:
            # Get the service request from the database
            service_request = ServiceRequest.query.get_or_404(request_id)
            
            # Get data from the request
            data = request.get_json()
            
            # Validate and update status
            new_status = data.get('service_status')
            if not new_status:
                return {'message': 'Status is required'}, 400
            
            # Update status
            service_request.service_status = new_status
            
            # If closed or completed, set completion date
            if new_status.lower() in ['closed', 'completed', 'rejected']:
                service_request.date_of_completion = datetime.utcnow()
            
            # Commit changes
            db.session.commit()
            
            # Prepare response
            return {
                'message': 'Service request updated successfully',
                'service_request': {
                    'id': service_request.id,
                    'service_status': service_request.service_status,
                    'date_of_completion': service_request.date_of_completion.isoformat() if service_request.date_of_completion else None
                }
            }, 200
        
        except Exception as e:
            # Rollback in case of error
            db.session.rollback()
            return {
                'message': 'An error occurred while updating the service request',
                'error': str(e)
            }, 500


#customer api 
class CustomerServiceRequestsResource(Resource):
    def post(self):
        print("inside post")
        """
        Retrieve all service requests for a specific customer 
        with detailed service and professional information.
        
        :return: JSON response with service request details
        """
        try:
            # Get customer ID from request body
            data = request.get_json()
            customer_id = data.get('customer_id')
            
            if not customer_id:
                return {
                    'message': 'Customer ID is required',
                    'error': 'Bad Request'
                }, 400

            # Query service requests with joined professional and service information
            service_requests = (
                db.session.query(
                    ServiceRequest, 
                    Professional.full_name.label('professional_name'),
                    Professional.phone.label('professional_phone'),
                    Service.name.label('service_name')
                )
                .join(Professional, ServiceRequest.professional_id == Professional.id, isouter=True)
                .join(Service, ServiceRequest.service_id == Service.id)
                .filter(ServiceRequest.customer_id == customer_id)
                .order_by(ServiceRequest.date_of_request.desc())  # Most recent first
                .all()
            )
            print("done till here")
            # Prepare the response data
            results = []
            for (service_request, professional_name, professional_phone, service_name) in service_requests:
                results.append({
                    # ServiceRequest model fields
                    'id': service_request.id,
                    'service_id': service_request.service_id,
                    'professional_id': service_request.professional_id,
                    'date_of_request': service_request.date_of_request.isoformat() if service_request.date_of_request else None,
                    'date_of_completion': service_request.date_of_completion.isoformat() if service_request.date_of_completion else None,
                    'status': service_request.service_status,
                    'remarks': service_request.remarks,
                    
                    # Additional professional and service details
                    'professional_name': professional_name,
                    'phone': professional_phone,
                    'service_name': service_name
                })
            print(results)
            print("above is results of customer service requests")
            return jsonify(results)

        except Exception as e:
            print("error")
            print(e)
            # Error handling
            db.session.rollback()
            return {

                'message': 'An error occurred while fetching service requests',
                'error': str(e)
            }, 500



class ServiceRequestCloseResource(Resource):
    def post(self, request_id):
        """
        Close a specific service request
        :param request_id: ID of the service request to close
        :return: JSON response indicating closure status
        """
        try:
            # Authenticate and authorize the request
            # Retrieve the current user (assumed from authentication)
            # current_user_id = get_current_user_id()  # Implement this function to get authenticated user
            
            # # Find the specific service request
            service_request = ServiceRequest.query.get(request_id)
            
            # Validate request
            if not service_request:
                return {
                    'message': 'Service request not found',
                    'error': 'Not Found'
                }, 404
            
            # # Check if the request belongs to the current customer
            # if service_request.customer_id != current_user_id:
            #     return {
            #         'message': 'Unauthorized to close this service request',
            #         'error': 'Forbidden'
            #     }, 403
            print("done till this ")
            # Validate request status
            allowed_statuses = ['assigned', 'pending']
            if service_request.service_status.lower() not in allowed_statuses:
                return {
                    'message': f'Cannot close request with current status: {service_request.service_status}',
                    'error': 'Bad Request'
                }, 400
            
            # Update request status
            service_request.service_status = 'closed'
            print("done till this also")
            service_request.date_of_completion = datetime.now(timezone.utc)
            service_request.remarks = f"Request closed by customer on {datetime.now(timezone.utc)}"
            
            # Save changes to database
            db.session.commit()
            
            # # Log the closure action
            # activity_log = ActivityLog(
            #     user_id=current_user_id,
            #     action='close_service_request',
            #     details=f"Closed service request {request_id}"
            # )
            # db.session.add(activity_log)
            # db.session.commit()
            
            return {
                'message': 'Service request closed successfully',
                'request_id': request_id,
                'new_status': 'closed'
            }, 200
        
        # except SQLAlchemyError as db_error:
        #     # Rollback database session in case of database-related errors
        #     db.session.rollback()
        #     current_app.logger.error(f"Database error closing service request: {db_error}")
        #     return {
        #         'message': 'Database error occurred while closing service request',
        #         'error': str(db_error)
        #     }, 500
        
        except Exception as e:
            print(e)
            # Catch any other unexpected errors
            current_app.logger.error(f"Unexpected error closing service request: {e}")
            return {
                'message': 'An unexpected error occurred',
                'error': str(e)
            }, 500
        
        finally:
            # Ensure database session is closed
            db.session.close()




#for rating page 
class ServiceRequestDetailsResource(Resource):
    def get(self, request_id):
        """
        Retrieve detailed information for a specific service request for rating
        
        :param request_id: ID of the service request
        :return: JSON response with service request details
        """
        try:
            # Query service request with joined professional and service information
            service_request_details = (
                db.session.query(
                    ServiceRequest, 
                    Professional.full_name.label('professional_name'),
                    Service.name.label('service_name')
                )
                .join(Professional, ServiceRequest.professional_id == Professional.id)
                .join(Service, ServiceRequest.service_id == Service.id)
                .filter(ServiceRequest.id == request_id)
                .first()
            )
            
            # Check if service request exists
            if not service_request_details:
                return {
                    'message': 'Service request not found',
                    'error': 'Not Found'
                }, 404
            
            # Unpack the query result
            service_request, professional_name, service_name = service_request_details
            
            # Prepare response
            return {
                'id': service_request.id,
                'service_name': service_name,
                'professional_name': professional_name,
                'date_of_completion': service_request.date_of_completion.isoformat() if service_request.date_of_completion else None,
                'service_status': service_request.service_status
            }, 200
        
        except Exception as e:
            app.logger.error(f"Error fetching service request details: {e}")
            return {
                'message': 'An error occurred while fetching service request details',
                'error': str(e)
            }, 500


class RateServiceRequestResource(Resource):
    def post(self):
        try:
            # Parse request data
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['request_id', 'rating']
            for field in required_fields:
                if field not in data:
                    return {
                        'message': f'Missing required field: {field}',
                        'error': 'Bad Request'
                    }, 400
            
            # Retrieve the service request
            service_request = ServiceRequest.query.get(data['request_id'])
            
            # Validate service request
            if not service_request:
                return {
                    'message': 'Service request not found',
                    'error': 'Not Found'
                }, 404
            
            # Validate rating is between 1 and 5
            rating_value = data['rating']
            if not 1 <= rating_value <= 5:
                return {
                    'message': 'Rating must be between 1 and 5',
                    'error': 'Bad Request'
                }, 400
            
            # Update service request with rating details
            service_request.rating = rating_value
            service_request.rating_remarks = data.get('remarks', '')
            service_request.rated_at = datetime.now(timezone.utc)
            service_request.date_of_completion = datetime.now(timezone.utc)
            service_request.service_status = 'rated'
            
            # Commit to database
            db.session.commit()
            
            return {
                'message': 'Service request rated successfully'
            }, 200
        
        except Exception as e:
            # Rollback in case of error
            db.session.rollback()
            app.logger.error(f"Error rating service request: {e}")
            return {
                'message': 'An error occurred while rating the service request',
                'error': str(e)
            }, 500


# Add the new resources to the API
api.add_resource(ServiceRequestDetailsResource, '/service_request_details/<int:request_id>')
api.add_resource(RateServiceRequestResource, '/rate_service_request')

#======



#professional booking
class ProfessionalsByServiceResource(Resource):
    def get(self, service_id):
        # Query professionals by service ID
        ser_name = Service.query.filter_by(id=service_id).first().name
        professionals = Professional.query.filter_by(service_name=ser_name).all()
        
        # Transform professionals to a list of dictionaries
        professionals_list = [{
            'id': prof.id,
            'name': prof.full_name,
            'base_price': 'NA',  # As mentioned, base price not defined
            'avg_rating': 'NA'   # Average rating not present
        } for prof in professionals]
        
        return professionals_list, 200

class BookProfessionalResource(Resource):
    def post(self):
        # Get booking data from request
        data = request.json
        
        # Validate required fields
        required_fields = ['professional_id', 'user_id', 'service_id']
        if not all(field in data for field in required_fields):
            return {'error': 'Missing required booking information'}, 400
        try:
            new_service_request = ServiceRequest(
                service_id=data['service_id'],
                customer_id=data['user_id'],
                professional_id=data['professional_id'],
                date_of_request=datetime.now(),
                service_status='pending'
            )   
        
            db.session.add(new_service_request)
            db.session.commit()
            return {'message': 'Booking successful'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

        # # Create booking logic would go here
        # # For now, just return a success message
        # return {'message': 'Booking successful'}, 201

# Add these resources to your API
api.add_resource(ProfessionalsByServiceResource, '/professionals/service/<int:service_id>')
api.add_resource(BookProfessionalResource, '/book')



# Add the new resources to the API
api.add_resource(ProfessionalAPI, '/professionals/<int:professional_id>')
api.add_resource(ProfessionalListAPI, '/professionals')
api.add_resource(ServiceRequestAPI, '/service_requests/<int:request_id>')
api.add_resource(ServiceRequestListAPI, '/service_requests')
# Add the resources to the API
api.add_resource(ServiceAPI, '/services/<int:service_id>')
api.add_resource(ServiceListAPI, '/services')
#professional home page 
api.add_resource(ProfessionalServiceRequestsResource, '/service-requests/professional/<int:professional_id>')
api.add_resource(ProfessionalServiceRequestsResourcePut, '/service-requests/<int:request_id>')
#customer home page
api.add_resource(CustomerServiceRequestsResource, '/customer_service_requests')
#close service request
api.add_resource(ServiceRequestCloseResource, '/service_requests/<int:request_id>/close')