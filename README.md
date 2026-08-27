# Ticket Management System

A full-stack support ticket management system built with **React**, **FastAPI**, **SQLAlchemy**, and **MySQL**.

The application allows clients to create and manage support tickets while administrators can view, respond to, update, and delete tickets through a dedicated admin dashboard.

---

##  Features

###  Authentication

* User registration
* Secure password hashing
* User login
* JWT-based authentication
* Role-based access control
* Separate client and admin dashboards
* Protected API endpoints

### Client Dashboard

Clients can:

* Create support tickets
* View their own tickets
* View individual ticket details
* View ticket status
* Reply to their tickets
* View the full conversation history
* See when a ticket has been resolved

###  Admin Dashboard

Administrators can:

* View all support tickets
* Search tickets
* Filter tickets by status
* View individual tickets
* View ticket conversations
* Reply to clients
* Change ticket status
* Resolve tickets
* Reopen resolved tickets
* Delete tickets
* View ticket statistics

###  User Interface

* Responsive design
* Clean dashboard layout
* Ticket status badges
* Empty states
* Error states
* Loading states
* Hover effects
* Smooth animations and transitions
* Mobile-friendly layout

---

##  Tech Stack

### Frontend

* React
* JavaScript
* Axios
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT authentication
* Passlib/password hashing
* Uvicorn

### Database

* MySQL

---

## Project Structure

```text
ticket-system/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── ClientDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── ...
│   │
│   └── ...
│
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have installed:

* Python 3.10+
* Node.js
* npm
* MySQL

---

## Database Setup

Create a MySQL database for the application.

For example:

```sql
CREATE DATABASE ticket_system;
```

Update the database connection in the backend with your MySQL credentials.

---

##  Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install fastapi uvicorn sqlalchemy pymysql python-jose passlib bcrypt python-multipart
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI also provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## User Roles

The system supports two types of users.

### Client

Clients can create and manage their own support tickets.

```text
Client
  │
  ├── Create ticket
  ├── View tickets
  ├── View ticket details
  └── Reply to ticket
```

### Admin

Administrators have access to all tickets.

```text
Admin
  │
  ├── View all tickets
  ├── Search/filter tickets
  ├── View conversations
  ├── Reply to clients
  ├── Update ticket status
  └── Delete tickets
```

---

## Ticket Lifecycle

Tickets follow three main statuses:

```text
Open
  ↓
In Progress
  ↓
Resolved
```

Resolved tickets can also be reopened:

```text
Resolved
   ↓
 Open
```

---

## Authentication

Authentication is handled using JWT access tokens.

After logging in, the API returns an access token:

```json
{
  "access_token": "your-token",
  "token_type": "bearer"
}
```

Protected requests send the token using the `Authorization` header:

```text
Authorization: Bearer <token>
```

The backend uses the authenticated user's role to control access to client and admin functionality.

---

## 🔌 Main API Endpoints

### Authentication

| Method | Endpoint    | Description                    |
| ------ | ----------- | ------------------------------ |
| POST   | `/register` | Register a new client          |
| POST   | `/login`    | Log in                         |
| GET    | `/me`       | Get current authenticated user |

### Client Tickets

| Method | Endpoint                       | Description           |
| ------ | ------------------------------ | --------------------- |
| POST   | `/tickets`                     | Create a ticket       |
| GET    | `/tickets`                     | Get user's tickets    |
| GET    | `/tickets/{ticket_id}`         | Get a specific ticket |
| POST   | `/tickets/{ticket_id}/replies` | Reply to a ticket     |
| GET    | `/tickets/{ticket_id}/replies` | Get ticket replies    |

### Admin Tickets

| Method | Endpoint                             | Description           |
| ------ | ------------------------------------ | --------------------- |
| GET    | `/admin/tickets`                     | Get all tickets       |
| GET    | `/admin/tickets/{ticket_id}`         | Get a specific ticket |
| PUT    | `/admin/tickets/{ticket_id}`         | Update ticket status  |
| DELETE | `/admin/tickets/{ticket_id}`         | Delete a ticket       |
| GET    | `/admin/tickets/{ticket_id}/replies` | Get ticket replies    |
| POST   | `/admin/tickets/{ticket_id}/replies` | Reply to a ticket     |

---

## Testing

The main application functionality has been tested across both client and admin workflows.

### Client workflow

* [x] Register
* [x] Login
* [x] Create ticket
* [x] View tickets
* [x] Open ticket
* [x] Send reply
* [x] View conversation
* [x] Logout

### Admin workflow

* [x] Admin login
* [x] View all tickets
* [x] Search tickets
* [x] Filter tickets
* [x] Open ticket
* [x] View conversation
* [x] Send reply
* [x] Change ticket status
* [x] Resolve ticket
* [x] Reopen ticket
* [x] Delete ticket
* [x] Logout

---

##  Future Improvements

Possible future improvements include:

* Email notifications
* Ticket priority levels
* File attachments
* Ticket categories
* User profile management
* Pagination for large ticket lists
* Admin user management
* Password reset functionality
* Deployment to a production environment
* Automated backend and frontend tests

---

## What I Learned

This project provided practical experience with:

* Building a full-stack web application
* Designing REST APIs with FastAPI
* Connecting a React frontend to a Python backend
* Working with relational databases
* Using SQLAlchemy ORM
* Implementing JWT authentication
* Password hashing
* Role-based access control
* CRUD operations
* Managing frontend state with React
* Handling API requests with Axios
* Designing responsive user interfaces
* Debugging frontend/backend integration issues

---

##  Author

**Kindya Mercy**

BSc Computer Science
University of Leicester

---

## License

This project was created for educational and portfolio purposes.


