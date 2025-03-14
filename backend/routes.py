import os 
from flask import Flask, render_template, jsonify
from flask import current_app as app, jsonify,request, redirect, url_for, flash, send_file
from flask_security import auth_required, verify_password, hash_password
from backend.models import db, Customer, Professional
from werkzeug.utils import secure_filename
from backend.auth_utils import custom_verify_password, find_user
from datetime import datetime
from backend.celery.tasks import add, create_csv
from celery.result import AsyncResult
import uuid
# from backend.auth_utils import role_required

# cache = app.cache

def generate_uniqifier():
    return str(uuid.uuid4())

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_cache():
    return app.cache
# Function to register all routes
def register_routes(app):
    @app.route('/')
    def home():
        # print("home")  # This will print when the route is accessed
        # return '<h1>Home Page</h1>'
        return render_template('index.html')  # You can use this if rendering templates
 
    @app.get('/cache')
    @app.cache.cached(timeout=5)
    def cache():
        return {'time': str(datetime.now())}

    # @app.get('/cache')
    # @app.cache.cached(timeout=5)
    # def cache():
    #     # cache = get_cache()  # Access cache within the context
    #     return {'time': str(datetime.now())}

# @app.route('/')
# def home():
#     print("home")
#     return '<h1> home page</h1>'
#     # return render_template('index.html')
    #@auth_required('token')
    @app.get('/protected')
    def protected():
        return jsonify({'message': 'This is a protected route'})

    @app.get('/celery')
    def celery():
        result = add.delay(1, 2)
        return jsonify({'task_id': result.id})

    @app.get('/get-data/<id>')
    def get_data(id):
        result  = AsyncResult(id)
        if result.ready():
            return jsonify({'result': result.get()})
        else:
            return jsonify({'status': 'processing'})



    @app.get('/create-csv')
    def createCSV():
        task = create_csv.delay()
        return {'task_id': task.id}, 200

    @app.get('/get-csv/<id>')
    def getCSV(id):
        result = AsyncResult(id)
        print(f"Task ID: {id}, Task State: {result.state}, Task Result: {result.result}")

        print(id)
        print(result.ready())
        if result.ready():
            return send_file(f'./backend/celery/user-downloads/{result.result}')  # Send file as attachment
        else:
            return jsonify({'status': 'processing'})

    ##@auth_required('token')
    def protected():
        return '<h1> only accessible by auth user</h1>'

    # @app.route('/login', methods=['GET'])
    # def dummy_login():
    #     return jsonify({"message": "Login page is handled by frontend."}), 404
 

    
    @app.route('/login', methods=['POST'])
    def login():
        print("login")
        data = request.get_json() 
        print(data)

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"message" : "invalid inputs"}), 404
        # password = hash_password(password)
        print(password, "this is enteredt password")
        # valid_email = find_user(email)
        user = custom_verify_password(email, password)
        if user == None:
            print("user not found")
            
            return jsonify({"message": "Invalid credentials"}), 401
        print(user.full_name, "this is user")
        if user.role_id == 2:
            print(user.is_approved, "this is inside role 2")
            if user.is_approved == 2:
                return jsonify({"message": "Your profile is banned. Please contact admin."}), 423
            if user.is_approved == 0:
                return jsonify({"message": "Your profile is not approved yet. Please wait for admin approval or contact admin if banned."}), 403
            return jsonify({'token' : user.get_auth_token(), 'email' : user.user_id, 'role' : user.role_id,
			 'id' : user.id, 'fullname' : user.full_name})
        elif user.role_id == 0 :
            return jsonify({'token' : user.get_auth_token(), 'email' : user.email, 'role' : user.role_id,
                'id' : user.id, 'fullname' : user.full_name})
        elif user.role_id == 1:
            if not user.is_active:
                return jsonify({"message": "Your account is deactivated. Please contact admin."}), 423
            return jsonify({'token' : user.get_auth_token(), 'email' : user.email, 'role' : user.role_id,
                'id' : user.id, 'fullname' : user.full_name})
        return jsonify({"message": "Invalid credentials"}), 401

        # if not user:
        #     return jsonify({"message" : "invalid email"}), 404
        
        # if verify_password(password, user.password):
        #     return jsonify({'token' : user.get_auth_token(), 'email' : 
		# user.email, 'role' : user.roles[0].name, 'id' : user.id})
        
        # return jsonify({'message' : 'password wrong'}), 400

    @app.route('/register-customer', methods=['POST'])
    def register():
        data = request.get_json()
        print(data)
        email = data.get('email')
        password = data.get('password')
        fullname = data.get('fullName')
        address = data.get('address')
        pincode = data.get('pincode')
        
        user = find_user(email = email)

        if user:
            return jsonify({"message" : "user already exists"}), 404
        print("user not found")
        new_customer = Customer(email = email, password = hash_password(password), 
		full_name = fullname, address = address, pin_code = pincode, is_active = True, role_id = 1, fs_uniquifier = generate_uniqifier())
        db.session.add(new_customer)
        # Commit the transaction to save the customer in the database
        print("committing")
        try:
            db.session.commit()
            return jsonify({"message": "Customer registered successfully"}), 201
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({"message": "Error registering customer", "error": str(e)}), 500


    @app.route('/pro-reg', methods=['POST'])
    def pro_reg():
        if 'email' not in request.form or 'password' not in request.form or 'fullname' not in request.form:
            return jsonify({"error": "Missing required fields"}), 400

        email = request.form['email']
        password = hash_password(request.form['password'])
        fullname = request.form['fullname']
        service = request.form['service']
        experience = request.form['experience']
        address = request.form['address']
        pincode = request.form['pincode']

        # Check if user already exists
        user = find_user(email)
            # flash("User already exists. Please login.", "error")
            # return redirect(url_for('login'))
        if user:
            return jsonify({"message" : "user already exists"}), 404
        print("user not found")
        # Handle file upload
        file = request.files['document']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{email}.pdf")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
        else:
            return jsonify({"error": "Invalid file format. Only PDFs allowed."}), 400

        # Create new Professional
        new_professional = Professional(
            user_id=email,
            password=password,
            full_name=fullname,
            service_name=service,
            experience=experience,
            address=address,
            pin_code=pincode,
            role_id = 2,
            document_path=filepath,
            fs_uniquifier=generate_uniqifier()
        )
        
        # Save to database
        db.session.add(new_professional)


        try:
            db.session.commit()
            return jsonify({"message": "Customer registered successfully"}), 201
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({"message": "Error registering customer", "error": str(e)}), 500


        # db.session.commit()

        # flash("Registration completed successfully. Please wait for admin approval.", "success")
        # return redirect(url_for('login'))
    @app.route('/api/services', methods=['POST'])
    def create_service():
        print("inside create service")
        # Ensure only admin can create services
        # if not current_user.is_admin:
        #     return jsonify({"message": "Unauthorized"}), 403
        
        data = request.json
        print(data)
        
        # Validate input
        if not all(key in data for key in ['name', 'base_price', 'time_required', 'description']):
            return jsonify({"message": "Missing required fields"}), 400
        
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
            return jsonify({
                "id": new_service.id,
                "name": new_service.name,
                "base_price": new_service.base_price,
                "time_required": new_service.time_required,
                "description": new_service.description
            }), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error creating service", "error": str(e)}), 500