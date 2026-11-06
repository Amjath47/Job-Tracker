# Job Track Management System

A full-stack web application that helps users manage job applications, track interview schedules, monitor application progress, and organize their job search activities in one place.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Protected API endpoints
- User-specific data access

### Job Application Management
- Add, view, update, and delete job applications
- Search applications by company name or job role
- Filter by application status, job type, and location
- Sort applications by different fields
- Pagination
- Export job applications as CSV and PDF

### Interview Management
- Schedule and manage interviews
- Update interview details and feedback
- Search interviews by company or interview round
- Filter by interview status and mode
- Sort interviews by date
- Pagination
- Export interviews as CSV and PDF

### Dashboard Analytics
- Total job application statistics
- Application status breakdown
- Selection rate
- Interview statistics
- Upcoming interviews

## Technologies Used

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3
- Axios
- React Router DOM
- Vite

**Backend**
- Python
- Django
- Django REST Framework
- Django REST Framework Simple JWT
- ReportLab

**Database**
- PostgreSQL

**Tools**
- Git and GitHub
- Postman
- VS Code

## Project Structure

```text
JobTracker/
│
├── backend/
│   ├── accounts/
│   ├── jobs/
│   ├── interviews/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd JobTracker
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables in a `.env` file using the variable names expected by your Django settings.

Create the PostgreSQL database and configure its connection details.

Run migrations:

```bash
python manage.py migrate
```

Start the backend server:

```bash
python manage.py runserver
```

Backend URL: `http://127.0.0.1:8000/`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173/`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/accounts/register/` | Register user |
| POST | `/api/token/` | Login and obtain JWT tokens |
| POST | `/api/token/refresh/` | Refresh access token |
| GET | `/api/dashboard/` | Dashboard analytics |
| GET, POST | `/api/jobs/` | List and create applications |
| GET, PUT, PATCH, DELETE | `/api/jobs/<id>/` | Manage an application |
| GET | `/api/jobs/export/` | Export applications as CSV |
| GET | `/api/jobs/export/pdf/` | Export applications as PDF |
| GET, POST | `/api/interviews/` | List and create interviews |
| GET, PUT, PATCH, DELETE | `/api/interviews/<id>/` | Manage an interview |
| GET | `/api/interviews/export/` | Export interviews as CSV |
| GET | `/api/interviews/export/pdf/` | Export interviews as PDF |

Protected endpoints require JWT authentication.

## Testing

Run backend tests:

```bash
cd backend
python manage.py test
```

Build the frontend:

```bash
cd frontend
npm run build
```

## Future Improvements

- Deploy the application online
- Improve dashboard visualizations
- Add email notifications for upcoming interviews
- Add additional reporting features

## Author

**Mohamed Amjath**

Computer Science Engineering Graduate

GitHub: https://github.com/Amjath47
