from flask import Blueprint, request, jsonify
from app.models.user import get_user_by_id, update_user_profile, serialize_user
from app.models.event import get_event_by_id, serialize_event
from app.utils.auth_utils import token_required, admin_required
from bson import ObjectId

user_bp = Blueprint('user', __name__)

# Get user profile
@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify(serialize_user(current_user)), 200

# Update user profile
@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    # Only allow updating the profile field
    if 'profile' not in data:
        return jsonify({'error': 'Missing profile data'}), 400
    
    # Update profile
    profile_data = data['profile']
    success = update_user_profile(current_user['_id'], profile_data)
    
    if not success:
        return jsonify({'error': 'Failed to update profile'}), 500
    
    # Get updated user
    updated_user = get_user_by_id(current_user['_id'])
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': serialize_user(updated_user)
    }), 200

# Get user's registered events
@user_bp.route('/events', methods=['GET'])
@token_required
def get_user_events(current_user):
    user_role = current_user['role']
    
    # Get event IDs from user profile
    event_ids = []
    if user_role == 'volunteer':
        event_ids = current_user.get('profile', {}).get('events_participated', [])
    elif user_role == 'participant':
        event_ids = current_user.get('profile', {}).get('events_attended', [])
    
    # Get events
    events = []
    for event_id in event_ids:
        event = get_event_by_id(event_id)
        if event:
            events.append(serialize_event(event))
    
    return jsonify({
        'events': events,
        'count': len(events)
    }), 200

# Admin routes
@user_bp.route('', methods=['GET'])
@admin_required
def get_all_users(current_user):
    # Get query parameters
    role = request.args.get('role')
    
    # Build query
    query = {}
    if role:
        query['role'] = role
    
    # Get users from database
    users = list(db.users.find(query))
    
    # Serialize users
    users_data = [serialize_user(user) for user in users]
    
    return jsonify({
        'users': users_data,
        'count': len(users_data)
    }), 200

@user_bp.route('/<user_id>', methods=['GET'])
@admin_required
def get_user(current_user, user_id):
    user = get_user_by_id(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(serialize_user(user)), 200

# Import db at the end to avoid circular import
from app import db 