import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await API.post('accounts/register/', formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            setMessage(JSON.stringify(error.response?.data || 'Registration failed'));
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <div className="auth-heading">
                    <div className="auth-logo">SJ</div>
                    <h2>Create Account</h2>
                    <p>Get started with your ScribeJob</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>

                    <div className="auth-input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Minimum 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {message && (
                        <p className="error">{message}</p>
                    )}

                    <button type="submit" className="auth-submit-btn">
                        Create Account
                    </button>

                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login">Sign In</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Register;