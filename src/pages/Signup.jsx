import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        originalPassword: '',
        bio: '',
        profileImageUrl: ''
    });
    const [role, setRole] = useState('AUTHOR');
    const [error, setError] = useState('');
    const { signup, loading } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.username || !formData.email || !formData.originalPassword) {
            setError('Please fill in all required fields');
            return;
        }

        const result = await signup(formData, role);
        if (result.success) {
            alert('Signup successful! Please login.');
            navigate('/login');
        } else {
            setError('Signup failed. Please try again.');
            console.error(result.error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p className="auth-subtitle">Join our community of developers</p>

                {error && <div className="auth-error">{error}</div>}

                <div className="role-toggle-container">
                    <div className="role-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${role === 'USER' ? 'active' : ''}`}
                            onClick={() => setRole('USER')}
                        >
                            Reader
                        </button>
                        {/* <button
                            type="button"
                            className={`toggle-btn ${role === 'AUTHOR' ? 'active' : ''}`}
                            onClick={() => setRole('AUTHOR')}
                        >
                            Writer
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${role === 'ADMIN' ? 'active' : ''}`}
                            onClick={() => setRole('ADMIN')}
                        >
                            Admin
                        </button> */}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username *</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="originalPassword">Password *</label>
                        <input
                            type="password"
                            name="originalPassword"
                            id="originalPassword"
                            value={formData.originalPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            name="bio"
                            id="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <ImageUpload
                            label="Profile Image"
                            onUpload={(url) => setFormData(prev => ({ ...prev, profileImageUrl: url }))}
                            initialUrl={formData.profileImageUrl}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
