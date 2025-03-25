from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = 5000
    host = '0.0.0.0'
    debug = os.getenv('FLASK_DEBUG', '1') == '1'
    
    print(f"\n✨ Backend server running at http://localhost:{port}/api")
    print(f"MongoDB: {os.getenv('MONGO_URI')}")
    print("Press CTRL+C to quit\n")
    
    app.run(debug=debug, host=host, port=port) 