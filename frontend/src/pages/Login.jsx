import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post('token/', {
                username,
                password
            });

            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);

            navigate('/dashboard');
        } catch (error) {
            setMessage('Invalid username or password.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <div className="auth-heading">
                    <div className="auth-logo">SJ</div>
                    <h2>Welcome Back!</h2>
                    <p>Sign in to continue to your ScribeJob</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>

                    <div className="auth-input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {message && (
                        <p className="error">{message}</p>
                    )}

                    <button type="submit" className="auth-submit-btn">
                        Sign In
                    </button>

                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register">Create Account</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Login;