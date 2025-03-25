from flask import Blueprint, request, jsonify
from app.models.event import (
    create_event, get_event_by_id, update_event, delete_event, 
    get_all_events, register_for_event, cancel_registration, serialize_event
)
from app.utils.auth_utils import token_required, admin_required, JWT_SECRET_KEY
from bson import ObjectId
import jwt

events_bp = Blueprint('events', __name__)

# Get all events
@events_bp.route('', methods=['GET'])
def get_events():
    # Get query parameters
    status = request.args.get('status')
    category = request.args.get('category')
    published_only = request.args.get('published', '').lower() == 'true'
    include_unpublished = request.args.get('include_unpublished', '').lower() == 'true'
    
    # Check if user is admin (from token)
    is_admin = False
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            is_admin = data.get('role') == 'admin'
            print(f"User role from token: {data.get('role')}, is_admin: {is_admin}")
        except Exception as e:
            print(f"Error decoding token: {str(e)}")
    
    # Build filter criteria
    filter_criteria = {}
    if status:
        filter_criteria['status'] = status
    if category:
        filter_criteria['category'] = category
    
    # For non-admin users or if explicitly requested, only show published events
    # Admin users can see all events unless published_only is explicitly set
    show_published_only = not is_admin or published_only
    if is_admin and include_unpublished:
        show_published_only = False
    
    # Get events
    events = get_all_events(filter_criteria, show_published_only)
    
    return jsonify({
        'events': events,
        'count': len(events)
    }), 200

# Get event by ID
@events_bp.route('/<event_id>', methods=['GET'])
def get_event(event_id):
    event = get_event_by_id(event_id)
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    return jsonify(serialize_event(event)), 200

# Create a new event
@events_bp.route('', methods=['POST'])
@admin_required
def add_event(current_user):
    try:
        data = request.get_json()
        print("Received create event request with data:", data)
        print(f"Request made by admin: {current_user['name']} (ID: {current_user['_id']})")
        
        # Check for empty or None data
        if not data:
            print("Request data is empty or None")
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['event_name', 'description', 'start_date', 'end_date', 'location', 'category']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            print(f"Missing required fields: {missing_fields}")
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Create event
        print("Creating event with validated data")
        event = create_event(data)
        
        if not event:
            print("Failed to create event - create_event returned None")
            return jsonify({'error': 'Failed to create event'}), 500
        
        print(f"Event created successfully with ID: {event['event_id']}")
        return jsonify({
            'message': 'Event created successfully',
            'event': event
        }), 201
    except Exception as e:
        print(f"Error in add_event: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# Update an event
@events_bp.route('/<event_id>', methods=['PUT'])
@admin_required
def update_event_route(current_user, event_id):
    try:
        data = request.get_json()
        print(f"Received update request for event {event_id} with data:", data)
        
        # Check if event exists
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        # Update event
        updated_event = update_event(event_id, data)
        
        if not updated_event:
            print(f"Failed to update event {event_id}")
            return jsonify({'error': 'Failed to update event'}), 500
        
        return jsonify({
            'message': 'Event updated successfully',
            'event': updated_event
        }), 200
    except Exception as e:
        print(f"Error in update_event_route: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# Delete an event
@events_bp.route('/<event_id>', methods=['DELETE'])
@admin_required
def delete_event_route(current_user, event_id):
    # Check if event exists
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    # Delete event
    success = delete_event(event_id)
    
    if not success:
        return jsonify({'error': 'Failed to delete event'}), 500
    
    return jsonify({
        'message': 'Event deleted successfully'
    }), 200

# Register for an event
@events_bp.route('/<event_id>/register', methods=['POST'])
@token_required
def register_for_event_route(current_user, event_id):
    # Check if event exists and is published
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    if not event.get('publish_event', False):
        return jsonify({'error': 'Event is not published'}), 400
    
    # Register for event
    success, message = register_for_event(
        event_id=event_id,
        user_id=current_user['_id'],
        user_role=current_user['role']
    )
    
    if not success:
        return jsonify({'error': message}), 400
    
    return jsonify({
        'message': 'Successfully registered for event',
        'event_id': event_id
    }), 200

# Cancel registration for an event
@events_bp.route('/<event_id>/cancel', methods=['POST'])
@token_required
def cancel_registration_route(current_user, event_id):
    # Check if event exists
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    # Check if user is registered
    user_registered = any(
        p.get('user_id') == str(current_user['_id']) 
        for p in event.get('participants', [])
    )
    
    if not user_registered:
        return jsonify({'error': 'User is not registered for this event'}), 400
    
    # Cancel registration
    success = cancel_registration(event_id, current_user['_id'])
    
    if not success:
        return jsonify({'error': 'Failed to cancel registration'}), 500
    
    return jsonify({
        'message': 'Registration cancelled successfully',
        'event_id': event_id
    }), 200

# Get event participants
@events_bp.route('/<event_id>/participants', methods=['GET'])
@admin_required
def get_event_participants(current_user, event_id):
    # Check if event exists
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    participants = event.get('participants', [])
    
    return jsonify({
        'participants': participants,
        'count': len(participants)
    }), 200 