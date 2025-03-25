from datetime import datetime
from app import db, bcrypt
from bson import ObjectId

def serialize_user(user):
    """Serialize user object to dictionary, excluding sensitive information"""
    if user:
        user_dict = {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'profile': user.get('profile', {})
        }
        return user_dict
    return None

def get_user_by_email(email):
    """Find a user by email"""
    return db.users.find_one({'email': email})

def get_user_by_id(user_id):
    """Find a user by ID"""
    try:
        return db.users.find_one({'_id': ObjectId(user_id)})
    except:
        return None

def create_user(name, email, password, role='volunteer', additional_data=None):
    """Create a new user"""
    # Check if user already exists
    if get_user_by_email(email):
        return None
    
    # Hash password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # Create profile object based on role
    profile = {}
    if role == 'volunteer':
        profile = {
            'skills': additional_data.get('skills', []) if additional_data else [],
            'interests': additional_data.get('interests', []) if additional_data else [],
            'bio': additional_data.get('bio', '') if additional_data else '',
            'availability': additional_data.get('availability', '') if additional_data else '',
            'points': 0,
            'hours_contributed': 0,
            'events_participated': [],
            'phone_number': additional_data.get('phone_number', '') if additional_data else '',
            'photo_url': '',
            'address': additional_data.get('address', '') if additional_data else '',
            'certificates': [],
            'badges': []
        }
    elif role == 'participant':
        profile = {
            'disability_type': additional_data.get('disability_type', '') if additional_data else '',
            'interests': additional_data.get('interests', []) if additional_data else [],
            'events_attended': [],
            'phone_number': additional_data.get('phone_number', '') if additional_data else '',
            'emergency_contact': additional_data.get('emergency_contact', '') if additional_data else '',
            'age': additional_data.get('age', '') if additional_data else '',
            'photo_url': '',
            'address': additional_data.get('address', '') if additional_data else '',
            'special_needs': additional_data.get('special_needs', '') if additional_data else ''
        }
    elif role == 'admin':
        profile = {
            'department': additional_data.get('department', 'General') if additional_data else 'General',
            'phone_number': additional_data.get('phone_number', '') if additional_data else '',
            'photo_url': '',
            'permissions': additional_data.get('permissions', ['manage_events', 'view_users']) if additional_data else ['manage_events', 'view_users']
        }
    
    # Create user document
    user = {
        'name': name,
        'email': email,
        'password': hashed_password,
        'role': role,
        'profile': profile,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
        'last_login': None,
        'is_active': True
    }
    
    # Insert user to database
    result = db.users.insert_one(user)
    user['_id'] = result.inserted_id
    
    # Log the registration
    print(f"New user registered: {name}, {email}, role: {role}, id: {result.inserted_id}")
    
    return serialize_user(user)

def verify_password(user, password):
    """Verify password for a user"""
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return False
    return True

def update_user_profile(user_id, profile_data):
    """Update user profile"""
    try:
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$set': {
                    'profile': profile_data,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    except:
        return False 