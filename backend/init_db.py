from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt

# Load environment variables
load_dotenv()

# Connect to MongoDB
mongo_client = MongoClient(os.getenv('MONGO_URI'))
db = mongo_client['samarthanam']

# Instantiate Bcrypt
bcrypt = Bcrypt()

def init_db():
    try:
        # Verify MongoDB connection
        mongo_client.server_info()
        print("Connected to MongoDB successfully")
        
        # Clear existing data
        print("Dropping existing collections...")
        db.users.drop()
        db.events.drop()
        
        # Create admin user
        print("Creating admin user...")
        admin_user = {
            '_id': ObjectId(),
            'name': 'Admin User',
            'email': 'admin@samarthanam.org',
            'password': bcrypt.generate_password_hash('admin123').decode('utf-8'),
            'role': 'admin',
            'profile': {
                'department': 'Management',
                'phone_number': '+91 9876543200',
                'photo_url': 'https://source.unsplash.com/random/150x150/?manager',
                'permissions': ['manage_events', 'view_users', 'edit_settings', 'approve_volunteers']
            },
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'last_login': datetime.utcnow() - timedelta(hours=2),
            'is_active': True
        }
        db.users.insert_one(admin_user)
        
        # Create volunteer user
        volunteer_user = {
            '_id': ObjectId(),
            'name': 'John Volunteer',
            'email': 'volunteer@example.com',
            'password': bcrypt.generate_password_hash('volunteer123').decode('utf-8'),
            'role': 'volunteer',
            'profile': {
                'skills': ['Teaching', 'Communication', 'First Aid'],
                'interests': ['Education', 'Health'],
                'bio': 'Passionate about helping others and making a difference in the community.',
                'availability': 'Weekends',
                'points': 150,
                'hours_contributed': 45,
                'events_participated': [],
                'phone_number': '+91 9876543210',
                'photo_url': 'https://source.unsplash.com/random/150x150/?person',
                'address': '123 Volunteer St, Bengaluru',
                'certificates': ['First Aid Certified', 'Teaching Excellence Award'],
                'badges': ['Environmental Hero', 'Community Builder']
            },
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'last_login': datetime.utcnow() - timedelta(days=2),
            'is_active': True
        }
        db.users.insert_one(volunteer_user)
        
        # Create participant user
        participant_user = {
            '_id': ObjectId(),
            'name': 'Sara Participant',
            'email': 'participant@example.com',
            'password': bcrypt.generate_password_hash('participant123').decode('utf-8'),
            'role': 'participant',
            'profile': {
                'disability_type': 'Visual Impairment',
                'interests': ['Arts', 'Community', 'Technology'],
                'events_attended': [],
                'phone_number': '+91 9876543211',
                'emergency_contact': '+91 9876543222 (Relative)',
                'age': '28',
                'photo_url': 'https://source.unsplash.com/random/150x150/?woman',
                'address': '456 Participant Ave, Bengaluru',
                'special_needs': 'Screen reader accessibility required'
            },
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'last_login': datetime.utcnow() - timedelta(days=1),
            'is_active': True
        }
        db.users.insert_one(participant_user)
        
        # Create events
        print("Creating sample events...")
        events = [
            {
                '_id': ObjectId(),
                'event_name': 'Charity Run 2023',
                'description': 'Annual charity run to raise funds for visual impairment education',
                'start_date': (datetime.utcnow() + timedelta(days=30)).strftime('%Y-%m-%d'),
                'end_date': (datetime.utcnow() + timedelta(days=30)).strftime('%Y-%m-%d'),
                'location': 'Cubbon Park',
                'category': 'Sports',
                'status': 'Upcoming',
                'publish_event': True,
                'points_awarded': 50,
                'hours_required': 4,
                'participant_limit': 100,
                'age_restriction': 'No Restriction',
                'contact_information': 'run@samarthanam.org',
                'event_image': 'https://source.unsplash.com/random/800x600/?run',
                'requirements': ['No health issues', 'Comfortable running gear'],
                'skills_needed': ['Running', 'First Aid'],
                'participants': [],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            },
            {
                '_id': ObjectId(),
                'event_name': 'Education Workshop',
                'description': 'Workshop on teaching methods for visually impaired students',
                'start_date': (datetime.utcnow() + timedelta(days=45)).strftime('%Y-%m-%d'),
                'end_date': (datetime.utcnow() + timedelta(days=46)).strftime('%Y-%m-%d'),
                'location': 'Samarthanam Center',
                'category': 'Education',
                'status': 'Upcoming',
                'publish_event': False,
                'points_awarded': 30,
                'hours_required': 6,
                'participant_limit': 30,
                'age_restriction': '18+',
                'contact_information': 'workshop@samarthanam.org',
                'event_image': 'https://source.unsplash.com/random/800x600/?workshop',
                'requirements': ['Teaching experience preferred', 'Patience with children'],
                'skills_needed': ['Teaching', 'Communication'],
                'participants': [],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            },
            {
                '_id': ObjectId(),
                'event_name': 'Art Exhibition',
                'description': 'Art exhibition featuring works by differently-abled artists',
                'start_date': (datetime.utcnow() - timedelta(days=5)).strftime('%Y-%m-%d'),
                'end_date': (datetime.utcnow() + timedelta(days=5)).strftime('%Y-%m-%d'),
                'location': 'Gallery 1',
                'category': 'Cultural',
                'status': 'Ongoing',
                'publish_event': True,
                'points_awarded': 25,
                'hours_required': 3,
                'participant_limit': 50,
                'age_restriction': 'Family Friendly',
                'contact_information': 'art@samarthanam.org',
                'event_image': 'https://source.unsplash.com/random/800x600/?art',
                'requirements': ['Art appreciation', 'Good with people'],
                'skills_needed': ['Art', 'Communication'],
                'participants': [],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            },
            {
                '_id': ObjectId(),
                'event_name': 'Career Fair for Differently-Abled',
                'description': 'Career fair connecting differently-abled job seekers with inclusive employers',
                'start_date': (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%d'),
                'end_date': (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%d'),
                'location': 'Convention Center',
                'category': 'Community',
                'status': 'Completed',
                'publish_event': True,
                'points_awarded': 35,
                'hours_required': 8,
                'participant_limit': 150,
                'age_restriction': '18+',
                'contact_information': 'careers@samarthanam.org',
                'event_image': 'https://source.unsplash.com/random/800x600/?career',
                'requirements': ['Professional attire', 'Background in HR or career counseling preferred'],
                'skills_needed': ['Communication', 'Career Guidance', 'Networking'],
                'participants': [],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
        ]
        
        # Save the event IDs for later use
        event_ids = []
        for event in events:
            event_ids.append(str(event['_id']))
        
        # Insert events
        db.events.insert_many(events)
        
        # Update volunteer with registered events
        db.users.update_one(
            {'email': 'volunteer@example.com'},
            {'$set': {'profile.events_participated': [str(event_ids[0]), str(event_ids[2])]}}
        )
        
        # Update participant with registered events
        db.users.update_one(
            {'email': 'participant@example.com'},
            {'$set': {'profile.events_attended': [str(event_ids[2]), str(event_ids[3])]}}
        )
        
        # Update events with participants
        db.events.update_one(
            {'_id': ObjectId(event_ids[0])},
            {'$push': {'participants': {'user_id': str(volunteer_user['_id']), 'role': 'volunteer', 'status': 'confirmed'}}}
        )
        
        db.events.update_one(
            {'_id': ObjectId(event_ids[2])},
            {'$push': {'participants': {
                '$each': [
                    {'user_id': str(volunteer_user['_id']), 'role': 'volunteer', 'status': 'confirmed'},
                    {'user_id': str(participant_user['_id']), 'role': 'participant', 'status': 'confirmed'}
                ]
            }}}
        )
        
        db.events.update_one(
            {'_id': ObjectId(event_ids[3])},
            {'$push': {'participants': {'user_id': str(participant_user['_id']), 'role': 'participant', 'status': 'confirmed'}}}
        )
        
        print('Database initialized with sample data')
        print(f'Admin User: admin@samarthanam.org / admin123')
        print(f'Volunteer User: volunteer@example.com / volunteer123')
        print(f'Participant User: participant@example.com / participant123')
    except Exception as e:
        print(f"ERROR: Failed to initialize database: {str(e)}")
        print("Please check your MongoDB connection and try again.")
        raise

if __name__ == '__main__':
    init_db() 