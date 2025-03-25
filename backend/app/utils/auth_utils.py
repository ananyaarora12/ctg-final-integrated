import jwt
import os
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
from app import db, bcrypt
from dotenv import load_dotenv
from bson.objectid import ObjectId

load_dotenv()

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

def generate_token(user_id, role):
    """Generate a JWT token for a user"""
    # Ensure user_id is a string
    user_id_str = str(user_id)
    
    payload = {
        'user_id': user_id_str,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')
    print(f"Generated token for user {user_id_str} with role {role}")
    
    return token

def token_required(f):
    """Decorator for protected routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            print("Protected route called without token")
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            print(f"Decoding token: {token[:10]}...")
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            print(f"Token decoded successfully. User ID: {data['user_id']}, Role: {data['role']}")
            
            try:
                user_id = ObjectId(data['user_id'])
            except Exception as e:
                print(f"Error converting to ObjectId: {str(e)}")
                return jsonify({'message': 'Invalid user ID format!'}), 401
                
            current_user = db.users.find_one({'_id': user_id})
            
            if not current_user:
                print(f"User not found with ID: {data['user_id']}")
                return jsonify({'message': 'User not found!'}), 401
                
            print("Authentication successful for role:", data['role'])
            return f(current_user, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")
            return jsonify({'message': 'Invalid token!'}), 401
        except Exception as e:
            print(f"Other error during authentication: {str(e)}")
            return jsonify({'message': f'Authentication error: {str(e)}'}), 500
    
    return decorated

def admin_required(f):
    """Decorator for admin-only routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            print("Admin route called without token")
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            print(f"Decoding token: {token[:10]}...")
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            print(f"Token decoded successfully. User ID: {data['user_id']}, Role: {data['role']}")
            
            if data['role'] != 'admin':
                print(f"User role {data['role']} is not admin")
                return jsonify({'message': 'Admin access required!'}), 403
            
            try:
                user_id = ObjectId(data['user_id'])
            except Exception as e:
                print(f"Error converting to ObjectId: {str(e)}")
                return jsonify({'message': 'Invalid user ID format!'}), 401
                
            current_user = db.users.find_one({'_id': user_id})
            
            if not current_user:
                print(f"User not found with ID: {data['user_id']}")
                return jsonify({'message': 'User not found!'}), 401
                
            print("Admin authentication successful")
            return f(current_user, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")
            return jsonify({'message': 'Invalid token!'}), 401
        except Exception as e:
            print(f"Other error during admin authentication: {str(e)}")
            return jsonify({'message': f'Authentication error: {str(e)}'}), 500
    
    return decorated 