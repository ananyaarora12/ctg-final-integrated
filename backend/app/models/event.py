from datetime import datetime
from app import db
from bson import ObjectId

def serialize_event(event):
    """Serialize event object to dictionary"""
    if event:
        event_dict = event.copy()
        event_dict['event_id'] = str(event_dict.pop('_id', ''))
        return event_dict
    return None

def get_event_by_id(event_id):
    """Find an event by ID"""
    try:
        return db.events.find_one({'_id': ObjectId(event_id)})
    except:
        return None

def create_event(event_data):
    """Create a new event"""
    try:
        # Ensure all required fields are present
        required_fields = ['event_name', 'description', 'start_date', 'end_date', 'location', 'category']
        for field in required_fields:
            if not event_data.get(field):
                print(f"Missing required field: {field}")
                return None
        
        # Convert numeric fields
        points_awarded = int(event_data.get('points_awarded', 0))
        hours_required = int(event_data.get('hours_required', 0))
        participant_limit = int(event_data.get('participant_limit', 0))
        
        # Set appropriate default image URL based on category
        category = event_data.get('category', 'volunteer').lower()
        
        # Map of categories to specific image topics
        category_image_map = {
            'education': 'education,teaching,school',
            'health': 'health,medical,healthcare',
            'environment': 'environment,nature,conservation',
            'community': 'community,charity,neighborhood',
            'cultural': 'cultural,arts,heritage',
            'sports': 'sports,athletics,fitness',
            'tech': 'technology,coding,computer',
            'fundraising': 'fundraising,charity,donation',
            'other': 'volunteer,helping,community'
        }
        
        image_query = category_image_map.get(category.lower(), 'volunteer,charity')
        default_image_url = f"https://source.unsplash.com/random/800x600/?{image_query}"
        
        # Use provided image URL or default
        event_image = event_data.get('event_image')
        if not event_image:
            event_image = default_image_url
        
        # Create event document
        event = {
            'event_name': event_data.get('event_name', ''),
            'description': event_data.get('description', ''),
            'start_date': event_data.get('start_date', ''),
            'end_date': event_data.get('end_date', ''),
            'location': event_data.get('location', ''),
            'category': event_data.get('category', ''),
            'status': event_data.get('status', 'Upcoming'),
            'publish_event': event_data.get('publish_event', False),
            'points_awarded': points_awarded,
            'hours_required': hours_required,
            'participant_limit': participant_limit,
            'age_restriction': event_data.get('age_restriction', 'No Restriction'),
            'contact_information': event_data.get('contact_information', ''),
            'event_image': event_image,
            'requirements': event_data.get('requirements', []),
            'skills_needed': event_data.get('skills_needed', []),
            'participants': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        print("Inserting event:", event)
        result = db.events.insert_one(event)
        event['_id'] = result.inserted_id
        
        serialized_event = serialize_event(event)
        print("Created event:", serialized_event)
        return serialized_event
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        return None

def update_event(event_id, event_data):
    """Update an existing event"""
    try:
        print(f"Updating event: {event_id} with data:", event_data)
        event_id_obj = ObjectId(event_id)
        event = get_event_by_id(event_id)
        
        if not event:
            print(f"Event not found: {event_id}")
            return None
        
        # Update provided fields
        update_data = {k: v for k, v in event_data.items() if k not in ['_id', 'event_id', 'created_at']}
        update_data['updated_at'] = datetime.utcnow()
        
        # Convert numeric fields
        if 'points_awarded' in update_data:
            update_data['points_awarded'] = int(update_data['points_awarded'])
        if 'hours_required' in update_data:
            update_data['hours_required'] = int(update_data['hours_required'])
        if 'participant_limit' in update_data:
            update_data['participant_limit'] = int(update_data['participant_limit'])
        
        # Handle event_image if category was changed but image wasn't specified
        if 'category' in update_data and (not update_data.get('event_image') or update_data.get('event_image') == ''):
            category = update_data.get('category', 'volunteer').lower()
            
            # Map of categories to specific image topics (same as in create_event)
            category_image_map = {
                'education': 'education,teaching,school',
                'health': 'health,medical,healthcare',
                'environment': 'environment,nature,conservation',
                'community': 'community,charity,neighborhood',
                'cultural': 'cultural,arts,heritage',
                'sports': 'sports,athletics,fitness',
                'tech': 'technology,coding,computer',
                'fundraising': 'fundraising,charity,donation',
                'other': 'volunteer,helping,community'
            }
            
            image_query = category_image_map.get(category.lower(), 'volunteer,charity')
            update_data['event_image'] = f"https://source.unsplash.com/random/800x600/?{image_query}"
        
        print(f"Updating with data:", update_data)
        result = db.events.update_one(
            {'_id': event_id_obj},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            updated_event = get_event_by_id(event_id)
            print(f"Event updated: {event_id}")
            return serialize_event(updated_event)
        elif result.matched_count > 0:
            # Document was found but not modified (no changes)
            print(f"Event found but not modified (no changes): {event_id}")
            return serialize_event(event)
        else:
            print(f"No event matched for update: {event_id}")
            return None
    except Exception as e:
        print(f"Error updating event {event_id}: {str(e)}")
        return None

def delete_event(event_id):
    """Delete an event"""
    try:
        result = db.events.delete_one({'_id': ObjectId(event_id)})
        return result.deleted_count > 0
    except:
        return False

def get_all_events(filter_criteria=None, published_only=False):
    """Get all events with optional filtering"""
    query = {}
    
    if filter_criteria:
        if 'status' in filter_criteria:
            query['status'] = filter_criteria['status']
        if 'category' in filter_criteria:
            query['category'] = filter_criteria['category']
    
    if published_only:
        query['publish_event'] = True
    
    events = list(db.events.find(query).sort('start_date', 1))
    return [serialize_event(event) for event in events]

def register_for_event(event_id, user_id, user_role):
    """Register a user for an event"""
    try:
        event = get_event_by_id(event_id)
        if not event:
            return False, "Event not found"
        
        # Check if event has reached participant limit
        if len(event.get('participants', [])) >= event.get('participant_limit', 0) and event.get('participant_limit', 0) > 0:
            return False, "Event has reached its participant limit"
        
        # Check if user is already registered
        if any(p.get('user_id') == str(user_id) for p in event.get('participants', [])):
            return False, "User already registered for this event"
        
        # Add user to event participants
        participant = {
            'user_id': str(user_id),
            'role': user_role,
            'registration_date': datetime.utcnow().isoformat(),
            'status': 'registered'
        }
        
        result = db.events.update_one(
            {'_id': ObjectId(event_id)},
            {'$push': {'participants': participant}}
        )
        
        # Add event to user's profile
        field = 'profile.events_participated' if user_role == 'volunteer' else 'profile.events_attended'
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$addToSet': {field: str(event_id)}}
        )
        
        return result.modified_count > 0, "Registration successful"
    except Exception as e:
        return False, str(e)

def cancel_registration(event_id, user_id):
    """Cancel a user's registration for an event"""
    try:
        # Remove user from event participants
        result = db.events.update_one(
            {'_id': ObjectId(event_id)},
            {'$pull': {'participants': {'user_id': str(user_id)}}}
        )
        
        # Remove event from user's profile in both possible locations
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$pull': {
                    'profile.events_participated': str(event_id),
                    'profile.events_attended': str(event_id)
                }
            }
        )
        
        return result.modified_count > 0
    except:
        return False 