import os 
from flask import Flask, render_template, jsonify
from flask import current_app as app, jsonify,request, redirect, url_for, flash
from flask_security import auth_required, verify_password, hash_password
from backend.models import db, Customer, Professional
from werkzeug.utils import secure_filename
from backend.auth_utils import custom_verify_password, find_user
from datetime import datetime
from backend.celery.tasks import add, create_csv
from celery.result import AsyncResult
import uuid

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
 

# @app.route('/')
# def home():
#     print("home")
#     return '<h1> home page</h1>'
#     # return render_template('index.html')

    @app.get('/protected')

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

    @app.get('/cache')
    @app.cache.cached(timeout=5)
    def cache():
        # cache = get_cache()  # Access cache within the context
        return {'time': str(datetime.now())}

    @app.get('/create-csv')
    def createCSV():
        task = create_csv.delay()
        return {'task_id': task.id}, 200

    @auth_required('token')
    def protected():
        return '<h1> only accessible by auth user</h1>'

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
        user = custom_verify_password(email, password)
        print(user.full_name, "this is user")
        if user:
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
        if find_user(email):
            flash("User already exists. Please login.", "error")
            return redirect(url_for('login'))

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
            email=email,
            password=password,
            fullname=fullname,
            service=service,
            experience=experience,
            address=address,
            pincode=pincode,
            document_path=filepath
        )
        
        # Save to database
        db.session.add(new_professional)
        db.session.commit()

        flash("Registration completed successfully. Please wait for admin approval.", "success")
        return redirect(url_for('login'))