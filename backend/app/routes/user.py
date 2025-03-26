from flask import Blueprint, request, jsonify
from app.models.user import get_user_by_id, update_user_profile, serialize_user
from app.models.event import get_event_by_id, serialize_event
from app.utils.auth_utils import token_required, admin_required
from bson import ObjectId
from datetime import datetime

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

# Leaderboard route
@user_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_leaderboard(current_user):
    # Get time period from query parameters
    period = request.args.get('period', 'all-time')
    
    # Define query based on role
    query = {'role': 'volunteer'}
    
    # Fetch volunteers from the database
    volunteers = list(db.users.find(query))
    
    # Sort volunteers by points in descending order
    sorted_volunteers = sorted(
        volunteers, 
        key=lambda x: x.get('profile', {}).get('points', 0), 
        reverse=True
    )
    
    # Limit to top 20 volunteers
    top_volunteers = sorted_volunteers[:20]
    
    # Serialize volunteers
    leaderboard_data = []
    for i, volunteer in enumerate(top_volunteers):
        user_data = serialize_user(volunteer)
        # Add additional leaderboard-specific fields
        user_data['rank'] = i + 1
        
        # Get profile data
        profile = volunteer.get('profile', {})
        
        # Map to expected format
        user_data['displayName'] = volunteer['name']
        user_data['points'] = profile.get('points', 0)
        user_data['level'] = calculate_level(profile.get('points', 0))
        user_data['nextLevelPoints'] = calculate_next_level_points(profile.get('points', 0))
        user_data['hoursVolunteered'] = profile.get('hours_contributed', 0)
        user_data['eventsAttended'] = profile.get('events_participated', [])
        user_data['eventsRegistered'] = profile.get('events_participated', [])  # Using same field for now
        user_data['badgesEarned'] = profile.get('badges', [])
        
        # Create empty arrays for badges and category distributions if not present
        user_data['badges'] = []
        for badge_id in profile.get('badges', []):
            user_data['badges'].append({
                'id': badge_id,
                'name': badge_id.capitalize(),
                'description': f'Earned the {badge_id} badge',
                'icon': 'award',
                'earnedDate': datetime.utcnow().isoformat()
            })
        
        # Add stats
        user_data['stats'] = {
            'totalEvents': len(profile.get('events_participated', [])),
            'totalHours': profile.get('hours_contributed', 0),
            'categoryDistribution': [],
            'monthlyActivity': []
        }
        
        leaderboard_data.append(user_data)
    
    return jsonify(leaderboard_data), 200

# Helper functions for leaderboard
def calculate_level(points):
    """Calculate level based on points"""
    if points < 100:
        return 1
    elif points < 250:
        return 2
    elif points < 500:
        return 3
    elif points < 1000:
        return 4
    else:
        return 5

def calculate_next_level_points(points):
    """Calculate points needed for next level"""
    if points < 100:
        return 100
    elif points < 250:
        return 250
    elif points < 500:
        return 500
    elif points < 1000:
        return 1000
    else:
        return 2000

# Import db at the end to avoid circular import
from app import db 