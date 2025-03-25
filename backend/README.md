# Samarthanam Backend

This is the backend for the Samarthanam application, providing API endpoints for authentication, events management, user profiles, and event registration.

## Technologies Used

- Python 3.8+
- Flask - Web framework
- MongoDB - Database
- JWT - Authentication

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- MongoDB installed locally or a MongoDB Atlas account
- pip (Python package manager)

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd samarthanam/backend
```

2. Create a virtual environment:
```
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
   ```
   venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```
   source venv/bin/activate
   ```

4. Install dependencies:
```
pip install -r requirements.txt
```

5. Set up MongoDB:
   - Make sure MongoDB is running locally on port 27017, or
   - Create a MongoDB Atlas cluster and update the `MONGO_URI` in `.env` file

6. Update the `.env` file:
   - Set a secure `JWT_SECRET_KEY`
   - Update `MONGO_URI` if needed

### Initialize Database

Run the following command to initialize the database with sample data:

```
python init_db.py
```

This will create:
- Admin user: admin@samarthanam.org / admin123
- Volunteer user: volunteer@example.com / volunteer123
- Participant user: participant@example.com / participant123
- Sample events

### Running the Application

Start the Flask server:

```
python run.py
```

The server will start running on `http://localhost:5000`.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/validate-token` - Validate JWT token

### Events

- `GET /api/events` - Get all events
- `GET /api/events/<event_id>` - Get event by ID
- `POST /api/events` - Create a new event (admin only)
- `PUT /api/events/<event_id>` - Update an event (admin only)
- `DELETE /api/events/<event_id>` - Delete an event (admin only)
- `POST /api/events/<event_id>/register` - Register for an event
- `POST /api/events/<event_id>/cancel` - Cancel event registration
- `GET /api/events/<event_id>/participants` - Get event participants (admin only)

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/events` - Get user's registered events
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/<user_id>` - Get user by ID (admin only)

## Frontend Integration

To connect the frontend to this backend, ensure that your frontend makes API requests to `http://localhost:5000` (or the appropriate host). The authentication flow should:

1. Use the `/api/auth/register` or `/api/auth/login` endpoints to obtain a JWT token
2. Store this token in local storage or a secure cookie
3. Include this token in the Authorization header for subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

## Error Handling

API endpoints return appropriate HTTP status codes:
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Server Error 