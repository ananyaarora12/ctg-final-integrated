#!/bin/bash

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Initialize database with sample data
echo "Initializing database with sample data..."
python init_db.py

echo "Setup complete! You can now run the backend server using:"
echo "source venv/bin/activate && python run.py" 