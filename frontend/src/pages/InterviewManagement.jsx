import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function InterviewManagement() {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [modeFilter, setModeFilter] = useState('');
    const [sortBy, setSortBy] = useState('interview_date');

    const [formData, setFormData] = useState({
        job_application: '',
        interview_date: '',
        interview_round: '',
        interview_mode: 'Online',
        status: 'Scheduled',
        feedback: ''
    });

    const [theme] = useState(() => {
        return localStorage.getItem('jobtracker-theme') || 'light';
    });

    const getInterviews = async () => {
        const token = localStorage.getItem('access');

        try {
            const response = await API.get('interviews/', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: page,
                    search: search,
                    status: statusFilter,
                    mode: modeFilter,
                    sort_by: sortBy
                }
            });

            setInterviews(response.data.results || response.data);

            setTotalCount(
                response.data.count ?? response.data.length
            );

            setHasNext(Boolean(response.data.next));
            setHasPrevious(Boolean(response.data.previous));

        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                navigate('/login');
            } else {
                setMessage('Unable to load interviews.');
            }
        }
    };

    const handleExportCSV = async () => {
        const token = localStorage.getItem('access');

        try {
            const response = await API.get('interviews/export/', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob'
            });

            const fileURL = window.URL.createObjectURL(
                new Blob([response.data], { type: 'text/csv' })
            );

            const link = document.createElement('a');

            link.href = fileURL;
            link.download = 'interviews.csv';

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(fileURL);

            setMessage('Interview CSV downloaded successfully!');

        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                navigate('/login');
            } else {
                setMessage('Unable to export interviews.');
            }
        }
    };

    const handleExportPDF = async () => {
        const token = localStorage.getItem('access');

        try {
            const response = await API.get('interviews/export/pdf/', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob'
            });

            const fileURL = window.URL.createObjectURL(
                new Blob([response.data], { type: 'application/pdf' })
            );

            const link = document.createElement('a');

            link.href = fileURL;
            link.download = 'interviews.pdf';

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(fileURL);

            setMessage('Interview PDF downloaded successfully!');

        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                navigate('/login');
            } else {
                setMessage('Unable to export interviews PDF.');
            }
        }
    };

    const getJobs = async () => {
        const token = localStorage.getItem('access');

        try {
            const response = await API.get('jobs/', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page_size: 50
                }
            });

            setJobs(response.data.results || response.data);
        } catch (error) {
            setMessage('Unable to load job applications.');
        }
    };

    useEffect(() => {
        getInterviews();
    }, [page, search, statusFilter, modeFilter, sortBy]);

    useEffect(() => {
        getJobs();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setEditingId(null);

        setFormData({
            job_application: '',
            interview_date: '',
            interview_round: '',
            interview_mode: 'Online',
            status: 'Scheduled',
            feedback: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('access');

        try {
            if (editingId) {
                await API.put(`interviews/${editingId}/`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMessage('Interview updated successfully!');
            } else {
                await API.post('interviews/', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMessage('Interview scheduled successfully!');
            }

            resetForm();
            getInterviews();

        } catch (error) {
            setMessage(JSON.stringify(
                error.response?.data || 'Operation failed.'
            ));
        }
    };

    const handleEdit = (interview) => {
        setEditingId(interview.id);

        setFormData({
            job_application: interview.job_application,
            interview_date: interview.interview_date
                ? (() => {
                    const date = new Date(interview.interview_date);
                
                    const offset = date.getTimezoneOffset();
                    const localDate = new Date(date.getTime() - offset * 60000);
                
                    return localDate.toISOString().slice(0, 16);
                })()
                : '',
            interview_round: interview.interview_round,
            interview_mode: interview.interview_mode,
            status: interview.status,
            feedback: interview.feedback || ''
        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this interview?')) {
            return;
        }

        const token = localStorage.getItem('access');

        try {
            await API.delete(`interviews/${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage('Interview deleted successfully!');
            getInterviews();

        } catch (error) {
            setMessage('Unable to delete interview.');
        }
    };

    
    return (
        <div className={`jobs-page ${theme === 'dark' ? 'dark-theme' : ''}`}>

            {/* Page Header */}
            <div className="jobs-header">
                <div className='interview-header'>
                    <h2>Interview Management</h2>
                    <p>Schedule, manage and track your interviews.</p>
                </div>

                <div className="jobs-header-actions">
                    <button className="export-btn" onClick={handleExportCSV}>
                        Export CSV
                    </button>

                    <button className="export-btn" onClick={handleExportPDF}>
                        Export PDF
                    </button>

                    <button
                        className="back-btn"
                        onClick={() => navigate('/dashboard')}
                    >
                        Dashboard
                    </button>
                </div>
            </div>

            {/* Schedule Interview Form */}
            <div className="job-form-container">

                <h3>
                    {editingId ? 'Update Interview' : 'Schedule New Interview'}
                </h3>

                <p>Enter the details of your upcoming interview.</p>

                <form className="job-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Job Application *</label>

                        <select
                            name="job_application"
                            value={formData.job_application}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Job Application</option>

                            {jobs.map((job) => (
                                <option key={job.id} value={job.id}>
                                    {job.company_name} - {job.job_role}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Interview Date & Time *</label>

                        <input
                            type="datetime-local"
                            name="interview_date"
                            value={formData.interview_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Interview Round *</label>

                        <input
                            type="text"
                            name="interview_round"
                            placeholder="e.g. Technical Round 1"
                            value={formData.interview_round}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Interview Mode</label>

                        <select
                            name="interview_mode"
                            value={formData.interview_mode}
                            onChange={handleChange}
                        >
                            <option value="Online">Online</option>
                            <option value="Offline">Offline</option>
                            <option value="Phone">Phone</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Interview Status</label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Interview Feedback</label>

                        <textarea
                            name="feedback"
                            placeholder="Enter interview feedback or notes (optional)"
                            value={formData.feedback}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-actions full-width">

                        <button type="submit" className="add-job-btn">
                            {editingId ? 'Update Interview' : 'Schedule Interview'}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={resetForm}
                            >
                                Cancel Edit
                            </button>
                        )}

                    </div>

                </form>
            </div>

            {/* Message */}
            {message && (
                <p className="job-message">{message}</p>
            )}

            {/* Search and Filters */}
            <div className="job-filters-container">

                <h3>Search & Filter Interviews</h3>

                <div className="job-filters">

                    <input
                        type="text"
                        placeholder="Search company or interview round..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                        value={modeFilter}
                        onChange={(e) => {
                            setModeFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Modes</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Phone">Phone</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="interview_date">Earliest First</option>
                        <option value="-interview_date">Latest First</option>
                    </select>

                    <button
                        type="button"
                        className="clear-filter-btn"
                        onClick={() => {
                            setSearch('');
                            setStatusFilter('');
                            setModeFilter('');
                            setSortBy('interview_date');
                            setPage(1);
                        }}
                    >
                        Clear Filters
                    </button>

                </div>
            </div>

            {/* Interview List */}
            <div className="job-list">

                <div className="job-list-header">
                    <div>
                        <h3>Your Interviews</h3>
                        <p>View and manage your scheduled interviews.</p>
                    </div>

                    <span className="job-count">
                        {totalCount} Interviews
                    </span>
                </div>

                {interviews.length === 0 ? (

                    <div className="empty-jobs">
                        <h3>No Interviews Found</h3>
                        <p>Schedule a new interview or change your filters.</p>
                    </div>

                ) : (

                    <div className="job-items">

                        {interviews.map((interview) => {

                            const relatedJob = jobs.find(
                                (job) => job.id === interview.job_application
                            );

                            return (
                                <div className="job-item" key={interview.id}>

                                    <div className="job-item-details">

                                        <div className="job-company-info">

                                            <h3>
                                                {relatedJob?.company_name || 'Company name unavailable'}
                                            </h3>

                                            <span className={`job-status interview-${interview.status.toLowerCase()}`}>
                                                {interview.status}
                                            </span>

                                        </div>

                                        <p className="job-role">
                                            {relatedJob?.job_role || 'Role unavailable'}
                                        </p>

                                        <div className="job-meta">

                                            <span>
                                                Round: {interview.interview_round}
                                            </span>

                                            <span>
                                                Mode: {interview.interview_mode}
                                            </span>

                                            <span>
                                                Date: {interview.interview_date
                                                    ? new Date(interview.interview_date).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })
                                                    : 'Date unavailable'}
                                            </span>

                                        </div>

                                        <div className="interview-feedback">
                                            <span>Feedback:</span>
                                            <p>
                                                {interview.feedback || 'No feedback yet'}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="job-item-actions">

                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(interview)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(interview.id)}
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                )}

                {/* Pagination */}
                <div className="pagination-controls">

                    <button
                        disabled={!hasPrevious}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </button>

                    <span>
                        Page {page} | Total Interviews: {totalCount}
                    </span>

                    <button
                        disabled={!hasNext}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </button>

                </div>

            </div>

        </div>
    );

}

export default InterviewManagement;