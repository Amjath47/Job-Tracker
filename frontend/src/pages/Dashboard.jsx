import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Dashboard() {
    const navigate = useNavigate();

    const [data, setData] = useState(null);

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('jobtracker-theme') || 'light';
    });

    useEffect(() => {
        const token = localStorage.getItem('access');

        if (!token) {
            navigate('/login');
            return;
        }

        API.get('dashboard/', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => {
                setData(response.data);
            })
            .catch(() => {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                navigate('/login');
            });
    }, [navigate]);

    useEffect(() => {
        localStorage.setItem('jobtracker-theme', theme);
    }, [theme]);

    const totalApplications = data?.total_applications || 0;

    const selectionRate = totalApplications > 0
        ? ((data.selected / totalApplications) * 100).toFixed(1)
        : 0;

    const applicationStatuses = [
        { name: 'Applied', count: data?.applied || 0 },
        { name: 'Assessment', count: data?.assessment || 0 },
        { name: 'Interview', count: data?.interview || 0 },
        { name: 'Selected', count: data?.selected || 0 },
        { name: 'Rejected', count: data?.rejected || 0 },
        { name: 'Withdrawn', count: data?.withdrawn || 0 }
    ];

    const statistics = [
        { name: 'Total Applications', count: data?.total_applications || 0 },
        { name: 'Applied', count: data?.applied || 0 },
        { name: 'Assessment', count: data?.assessment || 0 },
        { name: 'Interview', count: data?.interview || 0 },
        { name: 'Total Interviews', count: data?.total_interviews || 0 },
        { name: 'Selected', count: data?.selected || 0 },
        { name: 'Rejected', count: data?.rejected || 0 },
        { name: 'Withdrawn', count: data?.withdrawn || 0 },
        { name: 'Scheduled Interviews', count: data?.scheduled_interviews || 0 },
        { name: 'Completed Interviews', count: data?.completed_interviews || 0 },
        { name: 'Cancelled Interviews', count: data?.cancelled_interviews || 0 }
    ];

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login');
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    if (!data) {
        return (
            <div className={`dashboard dashboard-loading ${theme === 'dark' ? 'dark-theme' : ''}`}>
                <h3>Loading dashboard...</h3>
            </div>
        );
    }

    const upcomingInterviews = data.upcoming_interview_details || [];

    return (
        <div className={`dashboard ${theme === 'dark' ? 'dark-theme' : ''}`}>

            {/* Dashboard Header */}

            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <div className="dashboard-logo">SJ</div>

                    <div>
                        <h2>ScribeJob</h2>
                        <p>Manage your career journey</p>
                    </div>
                </div>

                <div className="dashboard-actions">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                    >
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>

                    <button
                        className="dashboard-nav-button"
                        onClick={() => navigate('/jobs')}
                    >
                        Manage Jobs
                    </button>

                    <button
                        className="dashboard-nav-button"
                        onClick={() => navigate('/interviews')}
                    >
                        Interviews
                    </button>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-content">

                {/* Welcome Section */}

                <section className="dashboard-welcome">
                    <div className="dashboard-overview">
                        <h1>Dashboard Overview</h1>
                        <p>Track your applications and stay updated on your progress.</p>
                    </div>

                    <span className="dashboard-date">
                        Your Job Search Summary
                    </span>
                </section>

                {/* Statistics Cards */}

                <section className="dashboard-section">
                    <div className="section-heading">
                        <h3>Application Statistics</h3>
                        <p>An overview of your job search activity</p>
                    </div>

                    <div className="dashboard-cards">
                        {statistics.map((item) => (
                            <div className="dashboard-stat-card" key={item.name}>
                                <p>{item.name}</p>
                                <h2>{item.count}</h2>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Analytics Section */}

                <section className="dashboard-section">
                    <div className="section-heading">
                        <h3>Application Analytics</h3>
                        <p>Understand your application progress</p>
                    </div>

                    <div className="dashboard-analytics">

                        {/* Application Status Breakdown */}

                        <div className="analytics-card">
                            <h3>Application Status Breakdown</h3>

                            {applicationStatuses.map((item) => (
                                <div className="status-item" key={item.name}>
                                    <div className="status-info">
                                        <span>{item.name}</span>
                                        <span>{item.count}</span>
                                    </div>

                                    <div className="status-bar">
                                        <div
                                            className={`status-progress status-${item.name.toLowerCase()}`}
                                            style={{
                                                width: totalApplications > 0
                                                    ? `${(item.count / totalApplications) * 100}%`
                                                    : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Selection Rate */}

                        <div className="analytics-card success-card">
                            <h3>Application Success Overview</h3>

                            <div className="selection-rate">
                                <h2>{selectionRate}%</h2>
                                <span>Selection Rate</span>
                            </div>

                            <div className="success-details">
                                <div>
                                    <span>Selected Applications</span>
                                    <strong>{data.selected || 0}</strong>
                                </div>

                                <div>
                                    <span>Total Applications</span>
                                    <strong>{totalApplications}</strong>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Upcoming Interviews */}

                <section className="dashboard-section upcoming-section">
                    <div className="section-heading">
                        <div>
                            <h3>Upcoming Interviews</h3>
                            <p>Keep track of your scheduled interviews</p>
                        </div>

                        <span className="upcoming-count">
                            {data.upcoming_interviews || 0} Upcoming
                        </span>
                    </div>

                    {upcomingInterviews.length === 0 ? (
                        <div className="empty-interviews">
                            <h3>No upcoming interviews</h3>
                            <p>Your scheduled interviews will appear here.</p>
                        </div>
                    ) : (
                        <div className="upcoming-interview-list">
                            {upcomingInterviews.map((item) => (
                                <div className="interview-card" key={item.id}>
                                    <div className="interview-company">
                                        <div className="company-initial">
                                            {item.company_name?.charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <h3>{item.company_name}</h3>
                                            <p>{item.job_role}</p>
                                        </div>
                                    </div>

                                    <div className="interview-details">
                                        <div>
                                            <span>Interview Round</span>
                                            <p>{item.interview_round}</p>
                                        </div>

                                        <div>
                                            <span>Date & Time</span>
                                            <p>
                                                {new Date(item.interview_date).toLocaleString('en-IN')}
                                            </p>
                                        </div>

                                        <div>
                                            <span>Mode</span>
                                            <p>{item.interview_mode}</p>
                                        </div>

                                        <div>
                                            <span>Status</span>
                                            <p className="interview-status">
                                                {item.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}

export default Dashboard;