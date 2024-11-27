from flask import current_app as app, jsonify, render_template,  request
from flask_security import auth_required, verify_password, hash_password
from backend.models import db, Customer
from backend.auth_utils import custom_verify_password, find_user

print("routes")


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

        email = data.get('email')
        password = data.get('password')
        fullname = data.get('fullname')
        address = data.get('address')
        pincode = data.get('pincode')
        
        user = find_user(email = email)

        if user:
            return jsonify({"message" : "user already exists"}), 404

        new_customer = Customer(email = email, password = hash_password(password), 
		fullname = fullname, address = address, pincode = pincode)
        db.session.add(new_customer)
        # Commit the transaction to save the customer in the database
        try:
            db.session.commit()
            return jsonify({"message": "Customer registered successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error registering customer", "error": str(e)}), 500