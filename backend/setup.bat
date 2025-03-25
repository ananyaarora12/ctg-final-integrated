@echo off
echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Initializing database with sample data...
python init_db.py

echo Setup complete! You can now run the backend server using:
echo venv\Scripts\activate.bat ^&^& python run.py
pause 