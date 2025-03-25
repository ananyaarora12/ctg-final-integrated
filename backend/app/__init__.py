from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask extensions
bcrypt = Bcrypt()

# MongoDB setup
try:
    mongo_uri = os.getenv('MONGO_URI')
    print(f"Connecting to MongoDB at: {mongo_uri}")
    mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    # Verify connection
    mongo_client.server_info()
    print("Successfully connected to MongoDB")
    db = mongo_client['samarthanam']
except Exception as e:
    print(f"ERROR: Failed to connect to MongoDB: {str(e)}")
    # Still create the client so the app can start, but it will handle errors when DB operations are attempted
    mongo_client = None
    db = None

def create_app():
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    
    # Initialize extensions
    bcrypt.init_app(app)
    
    # Configure CORS
    cors = CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.events import events_bp
    from app.routes.user import user_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy'}, 200
        
    @app.route('/api/test')
    def test_route():
        """Simple test route to verify API is working"""
        try:
            # Test DB connection if we have one
            db_status = "connected" if db and mongo_client else "not connected"
            if db and mongo_client:
                try:
                    # Try listing collections
                    collections = db.list_collection_names()
                    collection_list = list(collections)
                    return {
                        'status': 'ok',
                        'message': 'API is working',
                        'mongodb': db_status,
                        'collections': collection_list
                    }, 200
                except Exception as e:
                    return {
                        'status': 'warning',
                        'message': 'API is working but database error',
                        'mongodb': f"error: {str(e)}"
                    }, 200
            else:
                return {
                    'status': 'warning',
                    'message': 'API is working but no database connection',
                    'mongodb': db_status
                }, 200
        except Exception as e:
            return {
                'status': 'error',
                'message': f'API error: {str(e)}'
            }, 500
    
    return app 