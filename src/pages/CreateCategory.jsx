import { useState } from 'react';
import { createCategory } from '../api/category';
import './Auth.css'; // Reusing auth styles for form

const CreateCategory = () => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Note: Spec implies it returns 200 OK. 
            // If it returns the object with ID, we could show it.
            const result = await createCategory(name);
            console.log('Category created:', result);
            setSuccess('Category created successfully!');
            setName('');
        } catch (err) {
            setError('Failed to create category.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Category</h2>
                <p className="auth-subtitle">Add a new topic for posts</p>

                {error && <div className="auth-error">{error}</div>}
                {success && <div className="auth-error" style={{ color: 'var(--color-success)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>{success}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Category Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. React, Spring Boot"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Category'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCategory;
