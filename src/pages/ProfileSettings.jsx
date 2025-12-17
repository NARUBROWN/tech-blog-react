import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import './Auth.css';

const ProfileSettings = () => {
    const { user, updateUserInfo, loading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        profileImageUrl: '',
        originalPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                profileImageUrl: user.profileImageUrl || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!formData.originalPassword) {
            setMessage({ type: 'error', text: 'Password is required to save changes.' });
            return;
        }

        const result = await updateUserInfo(formData);
        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setFormData(prev => ({ ...prev, originalPassword: '' })); // Clear password after success
        } else {
            console.error(result.error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please check your password.' });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Profile Settings</h2>
                <p className="auth-subtitle">Update your personal information</p>

                {message.text && (
                    <div className={`auth-error ${message.type === 'success' ? 'success-message' : ''}`} style={message.type === 'success' ? { backgroundColor: '#d4edda', color: '#155724', borderColor: '#c3e6cb' } : {}}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
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
                        <label htmlFor="email">Email</label>
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

                    <div className="form-group" style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <label htmlFor="originalPassword">Confirm Password to Save</label>
                        <input
                            type="password"
                            name="originalPassword"
                            id="originalPassword"
                            value={formData.originalPassword}
                            onChange={handleChange}
                            required
                            placeholder="Enter current password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
