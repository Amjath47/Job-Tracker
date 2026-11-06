import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function JobApplications() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [jobTypeFilter, setJobTypeFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [sortBy, setSortBy] = useState('-created_at');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    const [formData, setFormData] = useState({
        company_name: '',
        job_role: '',
        job_description: '',
        job_location: '',
        job_type: 'Full Time',
        salary: '',
        application_date: new Date().toISOString().split('T')[0],
        status: 'Applied',
        job_url: '',
        notes: ''
    });

    const [theme] = useState(() => {
        return localStorage.getItem('jobtracker-theme') || 'light';
    });

    const getJobs = async () => {
        const token = localStorage.getItem('access');

        try {
            const response = await API.get('jobs/', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    search: search,
                    status: statusFilter,
                    job_type: jobTypeFilter,
                    location: locationFilter,
                    sort_by: sortBy,
                    page: page
                }
            });

            setJobs(response.data.results || response.data);

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
                setMessage('Unable to load job applications.');
            }
        }
    };

    const handleExportCSV = async () => {
        const token = localStorage.getItem('access');

        try {
            const response = await API.get('jobs/export/', {
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
            link.download = 'job_applications.csv';

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(fileURL);

            setMessage('CSV file downloaded successfully!');

        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                navigate('/login');
            } else {
                setMessage('Unable to export job applications.');
            }
        }
    };

    const handleExportPDF = async () => {
        const token = localStorage.getItem('access');

        try {
            const response = await API.get('jobs/export/pdf/', {
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
            link.download = 'job_applications.pdf';

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(fileURL);

            setMessage('Job Applications PDF downloaded successfully!');

        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                navigate('/login');
            } else {
                setMessage('Unable to export job applications PDF.');
            }
        }
    };

    useEffect(() => {
        getJobs();
    }, [search, statusFilter, jobTypeFilter, locationFilter, sortBy, page]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('access');

        try {
            if (editingId) {
                await API.put(`jobs/${editingId}/`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMessage('Application updated successfully!');
                setEditingId(null);
            } else {
                await API.post('jobs/', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMessage('Job application added successfully!');
            }

            setFormData({
                company_name: '',
                job_role: '',
                job_description: '',
                job_location: '',
                job_type: 'Full Time',
                salary: '',
                application_date: new Date().toISOString().split('T')[0],
                status: 'Applied',
                job_url: '',
                notes: ''
            });

            getJobs();

        } catch (error) {
            setMessage(JSON.stringify(
                error.response?.data || 'Operation failed.'
            ));
        }
    };

    const handleEdit = (job) => {
        setEditingId(job.id);

        setFormData({
            company_name: job.company_name,
            job_role: job.job_role,
            job_description: job.job_description || '',
            job_location: job.job_location,
            job_type: job.job_type,
            salary: job.salary || '',
            application_date: job.application_date,
            status: job.status,
            job_url: job.job_url || '',
            notes: job.notes || ''
        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this application?')) {
            return;
        }

        try {
            const token = localStorage.getItem('access');

            await API.delete(`jobs/${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage('Application deleted successfully!');
            getJobs();
        } catch (error) {
            setMessage('Unable to delete application.');
        }
    };

    return (
        <div className={`jobs-page ${theme === 'dark' ? 'dark-theme' : ''}`}>

            {/* Page Header */}
            <div className="jobs-header">
                <div className='jobapp-header'>
                    <h2>Job Applications</h2>
                    <p>Manage and track all your job applications.</p>
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

            {/* Add / Edit Application */}
            <div className="job-form-container">
                <h3>{editingId ? 'Update Application' : 'Add New Application'}</h3>
                <p>Enter the details of the job you have applied for.</p>

                <form className="job-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Company Name *</label>
                        <input
                            name="company_name"
                            placeholder="Enter company name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Job Role *</label>
                        <input
                            name="job_role"
                            placeholder="Enter job role"
                            value={formData.job_role}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Job Location *</label>
                        <input
                            name="job_location"
                            placeholder="Enter location"
                            value={formData.job_location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Job Type</label>
                        <select
                            name="job_type"
                            value={formData.job_type}
                            onChange={handleChange}
                        >
                            <option>Full Time</option>
                            <option>Part Time</option>
                            <option>Internship</option>
                            <option>Remote</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Salary</label>
                        <input
                            type="number"
                            name="salary"
                            placeholder="Enter salary (optional)"
                            value={formData.salary}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Application Date *</label>
                        <input
                            type="date"
                            name="application_date"
                            value={formData.application_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Application Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option>Applied</option>
                            <option>Assessment</option>
                            <option>Interview</option>
                            <option>Selected</option>
                            <option>Rejected</option>
                            <option>Withdrawn</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Job URL</label>
                        <input
                            name="job_url"
                            placeholder="Enter job link (optional)"
                            value={formData.job_url}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Job Description</label>
                        <textarea
                            name="job_description"
                            placeholder="Enter job description (optional)"
                            value={formData.job_description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            placeholder="Add your notes (optional)"
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-actions full-width">
                        <button type="submit" className="add-job-btn">
                            {editingId ? 'Update Application' : 'Add Application'}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({
                                        company_name: '',
                                        job_role: '',
                                        job_description: '',
                                        job_location: '',
                                        job_type: 'Full Time',
                                        salary: '',
                                        application_date: new Date().toISOString().split('T')[0],
                                        status: 'Applied',
                                        job_url: '',
                                        notes: ''
                                    });
                                }}
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
                <h3>Search & Filter Applications</h3>

                <div className="job-filters">

                    <input
                        type="text"
                        placeholder="Search company or job role..."
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
                        <option value="Applied">Applied</option>
                        <option value="Assessment">Assessment</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                    </select>

                    <select
                        value={jobTypeFilter}
                        onChange={(e) => {
                            setJobTypeFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Job Types</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Internship">Internship</option>
                        <option value="Remote">Remote</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Filter by location..."
                        value={locationFilter}
                        onChange={(e) => {
                            setLocationFilter(e.target.value);
                            setPage(1);
                        }}
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="-created_at">Newest First</option>
                        <option value="created_at">Oldest First</option>
                        <option value="company_name">Company Name (A-Z)</option>
                        <option value="-company_name">Company Name (Z-A)</option>
                        <option value="salary">Salary (Low to High)</option>
                        <option value="-salary">Salary (High to Low)</option>
                    </select>

                    <button
                        type="button"
                        className="clear-filter-btn"
                        onClick={() => {
                            setSearch('');
                            setStatusFilter('');
                            setJobTypeFilter('');
                            setLocationFilter('');
                            setSortBy('-created_at');
                            setPage(1);
                        }}
                    >
                        Clear Filters
                    </button>

                </div>
            </div>

            {/* Applications List */}
            <div className="job-list">
                <div className="job-list-header">
                    <div>
                        <h3>Your Applications</h3>
                        <p>View and manage your submitted applications.</p>
                    </div>

                    <span className="job-count">
                        {totalCount} Applications
                    </span>
                </div>

                {jobs.length === 0 ? (
                    <div className="empty-jobs">
                        <h3>No Applications Found</h3>
                        <p>Try changing your filters or add a new application.</p>
                    </div>
                ) : (
                    <div className="job-items">
                        {jobs.map((job) => (
                            <div className="job-item" key={job.id}>

                                <div className="job-item-details">
                                    <div className="job-company-info">
                                        <h3>{job.company_name}</h3>

                                        <span className={`job-status status-${job.status.toLowerCase()}`}>
                                            {job.status}
                                        </span>
                                    </div>

                                    <p className="job-role">{job.job_role}</p>

                                    <div className="job-meta">
                                        <span>📍 {job.job_location}</span>
                                        <span>💼 {job.job_type}</span>
                                        <span>📅 {job.application_date}</span>

                                        {job.salary && (
                                            <span>Salary: {job.salary}</span>
                                        )}
                                    </div>

                                    {job.job_url && (
                                        <a
                                            href={job.job_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="job-link"
                                        >
                                            View Job Posting
                                        </a>
                                    )}
                                </div>

                                <div className="job-item-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(job)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(job.id)}
                                    >
                                        Delete
                                    </button>
                                </div>

                            </div>
                        ))}
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
                        Page {page} | Total Applications: {totalCount}
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

export default JobApplications;