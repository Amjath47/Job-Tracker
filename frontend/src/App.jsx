import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JobApplications from './pages/JobApplications';
import InterviewManagement from './pages/InterviewManagement';

import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/jobs" element={<JobApplications />} />
                <Route path="/interviews" element={<InterviewManagement />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;