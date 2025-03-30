from flask import jsonify, request,make_response
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, current_user
from flask import current_app as app
from backend.models import Service, Professional, ServiceRequest, db, Customer
from backend.auth_utils import role_required
from flask_restful import reqparse
import datetime
from datetime import timezone, datetime
from flask_limiter.util import get_remote_address
# from app import role_required, generate_token
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity


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

# Customer list endpoint
class CustomerListResource(Resource):
    @jwt_required()
    @role_required([0])
    @cache.cached(timeout=3600, key_prefix="customers_list_all")
    def get(self):
        customers = Customer.query.all()
        customer_data = []
        for customer in customers:
            customer_data.append({
                'id': customer.id,
                'email': customer.email,
                'full_name': customer.full_name,
                'address': customer.address,
                'pin_code': customer.pin_code,
                'is_active': customer.is_active,
                'role_id': customer.role_id
            })
        return customer_data

# Customer toggle status endpoint
class CustomerToggleStatusResource(Resource):
    @jwt_required()
    @role_required(0)
    def patch(self, customer_id):
        customer = Customer.query.get(customer_id)
        if not customer:
            return {"message": "Customer not found"}, 404
            
        data = request.get_json()
        customer.is_active = data.get('is_active')
        
        try:
            db.session.commit()
            # Clear all relevant caches
            cache.delete("customers_list_all")  # Remove cached customer list

            return {
                'id': customer.id,
                'email': customer.email,
                'full_name': customer.full_name,
                'is_active': customer.is_active
            }
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating customer: {str(e)}"}, 500



class BlockUnblockProfessional(Resource):
    """
    API resource for blocking and unblocking professionals
    """
    @jwt_required()
    @role_required(0)
    def patch(self, professional_id):
        """
        Update professional's approval status between approved (1) and blocked (2)
        """
        try:
            print("inside block unblock professional")
            # Get the professional by ID
            professional = Professional.query.get(professional_id)
            
            if not professional:
                print("professional not found")
                return {"message": "Professional not found"}, 404
                
            # Get the new status from request data
            data = request.get_json()
            new_status = data.get('is_approved')
            print(new_status)
            # Validate the new status
            if new_status not in [1, 2]:
                return {"message": "Invalid status. Must be 1 (Approved) or 2 (Blocked)"}, 400
                
            # Store the original service name before update (needed for cache invalidation)
            service_name = professional.service_name

            # Update the professional's status
            P = Professional.query.filter_by(id=professional_id).first()
            print(P)
            print(P.is_approved)
            P.is_approved = new_status
            # professional.is_approved = new_status
            print(P.__dict__)  # Debugging
            try:
                db.session.commit()
                                # **Invalidate Cache for Affected Service**
                service = Service.query.filter_by(name=service_name).first()
                if service:
                    service_id = service.id
                    print(f"Invalidating cache for service_id: {service_id}")
                    cache.delete_memoized(ProfessionalsByServiceResource.get, ProfessionalsByServiceResource, service_id)
                #professionalapi get 
                professional_id = professional.id
                if professional_id:
                    cache.delete_memoized(ProfessionalAPI.get, ProfessionalAPI, professional_id)
                #professional list api
                cache.delete("professionals_list_all")

            except Exception as e:
                db.session.rollback()
                import traceback
                print("DB Commit Error:", str(e))
                print(traceback.format_exc())  # Print full error trace
                return {"message": f"Database error: {str(e)}"}, 500

            print("After update:", P.__dict__)  # Debugging
            
            # Return success response
            status_text = "unblocked" if new_status == 1 else "blocked"
            return {
                "message": f"Professional successfully {status_text}",
                "professional": {
                    "id": professional.id,
                    "full_name": professional.full_name,
                    "is_approved": professional.is_approved
                }
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating professional: {str(e)}"}, 500

#rating
class ServiceRequestRate(Resource):
    @jwt_required()
    @role_required(1)
    def put(self, request_id):
        """
        Rate a completed service request.
        
        :param request_id: ID of the service request to update
        :return: Updated service request details or error message
        """
        try:
            # Fetch the service request from the database
            service_request = ServiceRequest.query.get_or_404(request_id)
            data = request.get_json()

            # Check if the status is "completed"
            if service_request.service_status != "completed":
                return {'message': 'Only completed requests can be rated'}, 400

            # Validate input
            rating = data.get('rating')
            rating_remark = data.get('rating_remark')

            if not rating or not (1 <= rating <= 5):
                return {'message': 'Rating must be between 1 and 5'}, 400

            # Update service request
            service_request.rating = rating
            service_request.rating_remark = rating_remark
            service_request.service_status = "rated"

            db.session.commit()

            #ServiceRequestAPI
            # cache.delete_memoized(ServiceRequestAPI.get, ServiceRequestAPI, request_id)
            cache.delete("service_requests_all_v2")
            cache.delete_memoized(ProfessionalServiceRequestsResource.get, ProfessionalServiceRequestsResource, service_request.professional_id)

            return {
                'message': 'Service request rated successfully',
                'service_request': {
                    'id': service_request.id,
                    'service_status': service_request.service_status,
                    'rating': service_request.rating,
                    'rating_remark': service_request.rating_remark
                }
            }, 200

        except Exception as e:
            db.session.rollback()
            return {'message': 'An error occurred while rating the service request', 'error': str(e)}, 500


class ServiceRequestStatusUpdate(Resource):
    @jwt_required()
    @role_required([1,2])
    def put(self, request_id):
        """
        Update the status of a service request.
        
        :param request_id: ID of the service request to update
        :return: Updated service request details or error message
        """
        try:
            # Fetch the service request from the database
            service_request = ServiceRequest.query.get_or_404(request_id)
            data = request.get_json()

            # Get the new status
            new_status = data.get('service_status')
            if not new_status:
                return {'message': 'Status is required'}, 400

            # Define allowed transitions
            allowed_transitions = {
                'requested': ['cancelled'],
                'pending': ['completed'],
                'completed': ['rated'],
                'assigned': ['completed'],
            }

            # Check if the transition is valid
            if service_request.service_status not in allowed_transitions or \
               new_status not in allowed_transitions[service_request.service_status]:
                return {'message': 'Invalid status transition'}, 400

            # Update status
            service_request.service_status = new_status

            # If marking as completed or cancelling, set the completion date
            if new_status in ['completed', 'cancelled']:
                service_request.date_of_completion = datetime.utcnow()

            db.session.commit()

            #ServiceRequestAPI
            # cache.delete_memoized(ServiceRequestAPI.get, ServiceRequestAPI, request_id)
            cache.delete("service_requests_all_v2")
            cache.delete_memoized(ProfessionalServiceRequestsResource.get, ProfessionalServiceRequestsResource, service_request.professional_id)


            # Response
            return {
                'message': 'Service request updated successfully',
                'service_request': {
                    'id': service_request.id,
                    'service_status': service_request.service_status,
                    'date_of_completion': service_request.date_of_completion.isoformat() if service_request.date_of_completion else None
                }
            }, 200

        except Exception as e:
            db.session.rollback()
            return {'message': 'An error occurred while updating the service request', 'error': str(e)}, 500


### Services API
class ServiceAPI(Resource):
    @jwt_required()
    @role_required([0])
    def put(self, service_id):
    
        service = Service.query.get_or_404(service_id)
        
        data = request.json
        
        try:
            service.name = data['name']
            service.price = data['base_price']
            service.time_required = data['time_required']
            service.description = data['description']
            
            db.session.commit()

            # Invalidate cache for updated service
            cache.delete("all_services_list")
            
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

    @jwt_required()
    @role_required([0])
    def delete(self, service_id):
        # Fetch service
        service = Service.query.get_or_404(service_id)

        # Check if professionals are linked to this service
        linked_professionals = Professional.query.filter_by(service_name=service.name).first()

        if linked_professionals:
            response = jsonify({"message": f"Cannot delete '{service.name}' because professionals are linked to it."})
            return make_response(response, 400)  # Ensure response is properly structured

        try:
            db.session.delete(service)
            db.session.commit()
            cache.delete("all_services_list")
            response = jsonify({"message": "Service deleted successfully"})
            return make_response(response, 200)

        except Exception as e:
            db.session.rollback()
            response = jsonify({"message": str(e)})
            return make_response(response, 500)



### List APIs (Fetching all records)
class ServiceListAPI(Resource):
    @marshal_with(services_fields)
    @cache.cached(timeout = 3600, key_prefix = "all_services_list")
    def get(self): #for pro registration options
        services = Service.query.all()
        return services
    @jwt_required()
    @role_required([0])
    def post(self):
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
            cache.delete("all_services_list")
            
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




# Professionals List API
class ProfessionalListAPI(Resource):
    @jwt_required()
    @role_required([0])
    @marshal_with(professionals_fields)
    @cache.cached(timeout = 3600, key_prefix = "professionals_list_all")
    def get(self):
        try :
            print("inside professional api")
            print("inside get of professional list api")
            print("Headers Received:", request.headers)  # Debug request headers
            current_user = get_jwt_identity()
            print("Authenticated User:", current_user)  # Check if JWT is working
            # return jsonify(professionals_data)
            professionals = Professional.query.all()
            print(professionals, "this is professionals")
            return professionals
        except Exception as e:
            print(f"Error in professionals API: {str(e)}")
            return {'error': str(e)}, 500


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
        #remove professional cache
        service_id = Service.query.filter_by(name=professional.service_name).first().id
        cache.delete_memoized(ProfessionalsByServiceResource.get, ProfessionalsByServiceResource, service_id)
        cache.delete("professionals_list_all")

        return {"message": "Professional created"}

# Service Requests List API
class ServiceRequestListAPI(Resource):
    @jwt_required()
    @role_required([0,1])
    @marshal_with(service_requests_fields)
    @cache.cached(timeout = 3600, key_prefix = "service_requests_all_v2")
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

    @jwt_required()
    @role_required([1])
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
        cache.delete("service_requests_all_v2")
        cache.delete_memoized(ProfessionalServiceRequestsResource.get, ProfessionalServiceRequestsResource, data['professional_id'])
        return {"message": "Service request created"}


### Professionals API
class ProfessionalAPI(Resource):
    @jwt_required()
    @role_required([0,1])
    @marshal_with(professionals_fields)
    @cache.memoize(timeout=3600)
    def get(self, professional_id):
        professional = Professional.query.get(professional_id)
        if not professional:
            return {"message": "Professional not found"}, 404
        return professional
    @jwt_required()
    @role_required([0])
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
            cache.delete("professionals_list_all")
            service_id = Service.query.filter_by(name=professional.service_name).first().id
            cache.delete_memoized(ProfessionalsByServiceResource.get, ProfessionalsByServiceResource, service_id)
            
            return {"message": "Professional status updated successfully"}, 200
        
        except Exception as e:
            # Rollback in case of any error
            db.session.rollback()
            return {"message": str(e)}, 500
    @jwt_required()
    @role_required([0])
    def delete(self, professional_id):
            # Fetch professional
            professional = Professional.query.get_or_404(professional_id)

            # Check if professional has any service requests
            service_requests = ServiceRequest.query.filter_by(professional_id=professional.id).all()

            # If there are service requests, check their status
            for request in service_requests:
                if request.service_status in ["pending", "assigned"]:
                    return make_response(
                        jsonify({
                            "message": f"Cannot delete {professional.full_name} because they are handling an ongoing service."
                        }), 
                        400
                    )

            # If no pending/assigned services, delete all related service requests first
            try:
                for request in service_requests:
                    db.session.delete(request)

                # Now delete the professional
                db.session.delete(professional)
                db.session.commit()
                cache.delete("professionals_list_all")
                service_id = Service.query.filter_by(name=professional.service_name).first().id
                cache.delete_memoized(ProfessionalsByServiceResource.get, ProfessionalsByServiceResource, service_id)

                return make_response(jsonify({"message": "Professional deleted successfully"}), 200)
            except Exception as e:
                db.session.rollback()
                return make_response(jsonify({"message": str(e)}), 500)


### Service Requests API
# class ServiceRequestAPI(Resource):
    # @jwt_required()
    # @role_required([0,1,2])
    # @marshal_with(service_requests_fields)
    # @cache.memoize(timeout=3600 )
    # ##@auth_required('token')
    # def get(self, request_id):
    #     request = ServiceRequest.query.get(request_id)
    #     if not request:
    #         return {"message": "Service request not found"}, 404
    #     return request

    ##@auth_required('token')
    # @jwt_required()
    # @role_required([0])
    # def delete(self, request_id):
    #     request = ServiceRequest.query.get(request_id)
    #     professional_id = request.professional_id
    #     if not request:
    #         return {"message": "Service request not found"}, 404

    #     db.session.delete(request)
    #     db.session.commit()
    #     cache.delete("service_requests_all_v2")
    #     cache.delete_memoized(ProfessionalServiceRequestsResource.get, ProfessionalServiceRequestsResource, professional_id)

    #     return {"message": "Service request deleted"}


class ProfessionalServiceRequestsResource(Resource):
    @jwt_required()
    @role_required([2,0])
    @cache.memoize(timeout=3600)
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
            print(service_requests, "this is service requests")
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
    @jwt_required()
    @role_required([0,1,2])
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
            professional_id = service_request.professional_id

            
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
            cache.delete("service_requests_all_v2")
            cache.delete_memoized(ProfessionalServiceRequestsResource.get, ProfessionalServiceRequestsResource, professional_id)
            
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

# class ProfessionalServiceRequestsResourcePut(Resource):
#     @jwt_required()
#     @role_required([0,1,2])
#     def put(self, request_id):
#         print("inside put")
#         """
#         Update the status of a service request
        
#         :param request_id: ID of the service request to update
#         :return: Updated service request details or error message
#         """
#         try:
#             print("ProfessionalServiceRequestsResourcePut is being used")
#             # Get the service request from the database
#             service_request = ServiceRequest.query.get_or_404(request_id)
#             professional_id = service_request.professional_id
            
#             # Get data from the request
#             data = request.get_json()
            
#             # Validate and update status
#             new_status = data.get('service_status')
#             if not new_status:
#                 return {'message': 'Status is required'}, 400
            
#             # Update status
#             service_request.service_status = new_status
            
#             # If closed or completed, set completion date
#             if new_status.lower() in ['closed', 'completed', 'rejected']:
#                 service_request.date_of_completion = datetime.utcnow()
            
#             # Commit changes
#             db.session.commit()
#             cache.delete("service_requests_all_v2")
#             cache.delete_memoized(ProfessionalServiceRequestsResource.get, ProfessionalServiceRequestsResource, professional_id)
            
#             # Prepare response
#             return {
#                 'message': 'Service request updated successfully',
#                 'service_request': {
#                     'id': service_request.id,
#                     'service_status': service_request.service_status,
#                     'date_of_completion': service_request.date_of_completion.isoformat() if service_request.date_of_completion else None
#                 }
#             }, 200
        
#         except Exception as e:
#             # Rollback in case of error
#             db.session.rollback()
#             return {
#                 'message': 'An error occurred while updating the service request',
#                 'error': str(e)
#             }, 500


#customer api 
class CustomerServiceRequestsResource(Resource):
    @jwt_required()
    @role_required([0,1])
    # @cach
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
            print(customer_id)
            if not customer_id:
                return {
                    'message': 'Customer ID is required',
                    'error': 'Bad Request'
                }, 400

            # Query service requests with joined professional and service information
            service_requests = (
                db.session.query(
                    ServiceRequest.id,
                    ServiceRequest.service_status,
                    Professional.full_name.label('professional_name'),
                    Professional.phone.label('professional_phone'),
                    Service.name.label('service_name'),
                    ServiceRequest.date_of_completion,
                )
                .outerjoin(Professional, ServiceRequest.professional_id == Professional.id)
                .outerjoin(Service, ServiceRequest.service_id == Service.id)
                .filter(ServiceRequest.customer_id == customer_id)
                .order_by(ServiceRequest.date_of_request.desc())
                .all()
            )
            print(service_requests)
            print("done till here")
            # Prepare the response data
            results = []
            for (service_request,status, professional_name, professional_phone, service_name,doc) in service_requests:
                results.append({
                    # ServiceRequest model fields
                    'id': service_request,
                    # 'professional_id': service_request.professional_id,
                    # 'date_of_request': service_request.date_of_request.isoformat() if service_request.date_of_request else None,
                    'date_of_completion': doc,
                    'status': status,
                    # 'remarks': service_request.remarks,
                    
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
    @jwt_required()
    @role_required([0,1,2])
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
            db.session.commit()
            # Invalidate cache for updated service request
            # cache.delete_memoized(ServiceRequestAPI.get, ServiceRequestAPI, request_id)
            cache.delete("service_requests_all_v2")
            cache.delete_memoized(ProfessionalServiceRequestsResource.get, ProfessionalServiceRequestsResource, service_request.professional_id)
            


            return {
                'message': 'Service request closed successfully',
                'request_id': request_id,
                'new_status': 'closed'
            }, 200
        
        
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
    @jwt_required()
    @role_required([1])
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
    @jwt_required()
    @role_required([1])
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
            # cache.delete_memoized(ServiceRequestAPI.get, ServiceRequestAPI, data['request_id'])
            cache.delete("service_requests_all_v2")
            cache.delete_memoized(ProfessionalServiceRequestsResource.get, ProfessionalServiceRequestsResource, service_request.professional_id)
            
            
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


#professional booking
class ProfessionalsByServiceResource(Resource):
    @jwt_required()
    @role_required([0,1])
    @cache.memoize(timeout=3600)
    def get(self, service_id):
        # Query professionals by service ID
        ser_name = Service.query.filter_by(id=service_id).first().name
        professionals = Professional.query.filter_by(service_name=ser_name, is_approved=1).all()
        print(professionals)
        # Transform professionals to a list of dictionaries
        professionals_list = [{
            'id': prof.id,
            'name': prof.full_name,
            'address': prof.address,
            'pin_code': prof.pin_code,
            'base_price': 'NA',  # As mentioned, base price not defined
            'avg_rating': 'NA'   # Average rating not present
        } for prof in professionals]
        
        return professionals_list, 200

class BookProfessionalResource(Resource):
    @jwt_required()
    @role_required([1])
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
                service_status='requested'
            )   
        
            db.session.add(new_service_request)
            db.session.commit()
            #remove cache or service requests list , for all 
            cache.delete("service_requests_all_v2")
            cache.delete_memoized(ProfessionalServiceRequestsResource.get, ProfessionalServiceRequestsResource, data['professional_id'])
            return {'message': 'Booking successful'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

        # # Create booking logic would go here
        # # For now, just return a success message
        # return {'message': 'Booking successful'}, 201



class UpdateServiceRequestStatusResource(Resource):
    @jwt_required()
    @role_required([0,1,2])
    def put(self, request_id):
        try:
            print("UpdateServiceRequestStatusResource is being used")
            data = request.get_json()
            new_status = data.get('service_status')
            if not new_status:
                return {'message': 'Service status is required', 'error': 'Bad Request'}, 400

            service_request = ServiceRequest.query.get(request_id)
            if not service_request:
                return {'message': 'Service request not found', 'error': 'Not Found'}, 404

            service_request.service_status = new_status
            if new_status == 'closed':
                service_request.date_of_completion = db.func.current_timestamp()

            db.session.commit()
            # Invalidate cache for updated service request
            # cache.delete_memoized(ServiceRequestAPI.get, ServiceRequestAPI, request_id)
            cache.delete("service_requests_all_v2")
            cache.delete_memoized(ProfessionalServiceRequestsResource.get, ProfessionalServiceRequestsResource, service_request.professional_id)
            return {'message': 'Service request updated successfully'}
        except Exception as e:
            db.session.rollback()
            return {'message': 'An error occurred while updating service request', 'error': str(e)}, 500
    @jwt_required()
    def get(self, request_id):
        try:
            print(f"Fetching service request with ID: {request_id}")
            
            # Query with explicit column names to avoid ambiguity
            service_request = (
                db.session.query(
                    ServiceRequest.id,
                    Service.name.label('service_name'),
                    Customer.full_name.label('customer_name'),
                    Professional.full_name.label('professional_name'),
                    ServiceRequest.date_of_request,
                    ServiceRequest.date_of_completion,
                    ServiceRequest.service_status,
                    ServiceRequest.remarks,
                    ServiceRequest.rating,
                    ServiceRequest.rating_remarks,
                    ServiceRequest.rated_at
                )
                .join(Service, Service.id == ServiceRequest.service_id)
                .join(Customer, Customer.id == ServiceRequest.customer_id)
                .outerjoin(Professional, Professional.id == ServiceRequest.professional_id)
                .filter(ServiceRequest.id == request_id)
                .first()
            )

            if not service_request:
                return {'message': 'Service request not found'}, 404

            # Create response dictionary from the query result
            # Using the explicit labels we defined in the query
            result = {
                'id': service_request.id,
                'service_name': service_request.service_name,
                'customer_name': service_request.customer_name,
                'professional_name': service_request.professional_name,
                'date_of_request': service_request.date_of_request.isoformat() if service_request.date_of_request else None,
                'date_of_completion': service_request.date_of_completion.isoformat() if service_request.date_of_completion else None,
                'service_status': service_request.service_status,
                'remarks': service_request.remarks,
                'rating': service_request.rating,
                'rating_remarks': service_request.rating_remarks,
                'rated_at': service_request.rated_at.isoformat() if service_request.rated_at else None
            }

            return result, 200

        except Exception as e:
            print(f"Error in fetching service request: {str(e)}")
            db.session.rollback()  # Roll back the session in case of error
            return {'message': 'An error occurred while fetching service request', 'error': str(e)}, 500



"""
./pages/RateServicePage.js:               const response = await fetch(`/api/service-requests/${this.requestId}`,
./pages/pro_all_ser_req.js:                       const response = await fetch(`/api/service-requests/${requestId}`, { used-UpdateServiceRequestStatusResource
./pages/pro-home.js:              const response = await fetch(`/api/service-requests/${requestId}`, { used-UpdateServiceRequestStatusResource
"""
api.add_resource(UpdateServiceRequestStatusResource, '/service-requests/<int:request_id>') #used
# api.add_resource(ProfessionalServiceRequestsResourcePut, '/service-requests/<int:request_id>') #used
# Add these resources to your API
api.add_resource(ProfessionalsByServiceResource, '/professionals/service/<int:service_id>') #used
api.add_resource(BookProfessionalResource, '/book') #used
# Add the new resources to the API
api.add_resource(ProfessionalAPI, '/professionals/<int:professional_id>') #used
api.add_resource(ProfessionalListAPI, '/professionals') #used
# api.add_resource(ServiceRequestAPI, '/service_requests/<int:request_id>') 
api.add_resource(ServiceRequestListAPI, '/service_requests') #used
# Add the resources to the API
api.add_resource(ServiceAPI, '/services/<int:service_id>') #used
api.add_resource(ServiceListAPI, '/services') #used
#professional home page 
api.add_resource(ProfessionalServiceRequestsResource, '/service-requests/professional/<int:professional_id>') #used
#customer home page
api.add_resource(CustomerServiceRequestsResource, '/customer_service_requests') #used
#close service request
api.add_resource(ServiceRequestCloseResource, '/service_requests/<int:request_id>/close') #used
api.add_resource(ServiceRequestStatusUpdate, '/service-requests/<int:request_id>/update-status') #used
# Add resource to API
api.add_resource(ServiceRequestRate, '/service-requests/<int:request_id>/rate') #used
#customer
api.add_resource(CustomerListResource, '/customers') #used
api.add_resource(CustomerToggleStatusResource, '/customers/<int:customer_id>/toggle-status')  #used
# Add this line where you set up your API routes
api.add_resource(BlockUnblockProfessional, '/blockprofessional/<int:professional_id>') #used
# Add the new resources to the API
api.add_resource(ServiceRequestDetailsResource, '/service_request_details/<int:request_id>') #used
api.add_resource(RateServiceRequestResource, '/rate_service_request') #used