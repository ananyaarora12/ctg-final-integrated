from flask import Blueprint, request, jsonify
from app.models.user import create_user, get_user_by_email, verify_password, serialize_user, get_user_by_id
from app.utils.auth_utils import generate_token, JWT_SECRET_KEY
from datetime import datetime
from bson.objectid import ObjectId
from app import db
import jwt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['name', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate role if provided
    role = data.get('role', 'volunteer')
    if role not in ['volunteer', 'participant', 'admin']:
        return jsonify({'error': 'Invalid role'}), 400
    
    # Extract additional profile data if provided
    additional_data = {}
    if 'profile' in data:
        additional_data = data['profile']
    
    # Create user
    user = create_user(
        name=data['name'],
        email=data['email'],
        password=data['password'],
        role=role,
        additional_data=additional_data
    )
    
    if not user:
        return jsonify({'error': 'User with this email already exists'}), 400
    
    # Get user ID from the returned user data
    user_id = user['id']
    
    # Generate token for auto login
    token = generate_token(user_id, role)
    
    # Update last login time
    db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'last_login': datetime.utcnow()}}
    )
    
    print(f"User registered: {data['email']}, ID: {user_id}, Role: {role}")
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user,
        'token': token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'error': 'Missing email or password'}), 400
    
    # Find user by email
    user = get_user_by_email(data['email'])
    
    # Check if user exists
    if not user:
        return jsonify({'error': 'User not registered. Please create an account first.'}), 401
    
    # Verify password
    if not verify_password(user, data['password']):
        return jsonify({'error': 'Invalid password. Please try again.'}), 401
    
    # Update last login time
    db.users.update_one(
        {'_id': user['_id']},
        {'$set': {'last_login': datetime.utcnow()}}
    )
    
    # Convert ObjectId to string for JWT
    user_id_str = str(user['_id'])
    
    # Generate token
    token = generate_token(user_id_str, user['role'])
    
    print(f"User logged in: {user['email']}, ID: {user_id_str}, Role: {user['role']}")
    
    return jsonify({
        'message': 'Login successful',
        'user': serialize_user(user),
        'token': token
    }), 200

@auth_bp.route('/validate-token', methods=['GET'])
def validate_token():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'valid': False, 'message': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode the token
        data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        
        # Get user from database
        user_id = data.get('user_id')
        user = get_user_by_id(user_id)
        
        if not user:
            return jsonify({'valid': False, 'message': 'User not found'}), 401
        
        # Check if token is expired - this is handled by the jwt.decode function
        # Update last access time
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'last_access': datetime.utcnow()}}
        )
        
        # Return user data
        return jsonify({
            'valid': True,
            'message': 'Token is valid',
            'user': serialize_user(user)
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({'valid': False, 'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'valid': False, 'message': 'Invalid token'}), 401 