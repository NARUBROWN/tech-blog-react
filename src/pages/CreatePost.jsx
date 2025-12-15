import { useState } from 'react';
import { createPost } from '../api/post';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './PostForm.css';

const CreatePost = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        thumbnailUrl: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        categoryId: '',
        tags: '' // Comma separated string for UI
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const tagNames = formData.tags.split(',').map(t => t.trim()).filter(t => t);

            const payload = {
                title: formData.title,
                content: formData.content,
                thumbnailUrl: formData.thumbnailUrl,
                seoTitle: formData.seoTitle,
                seoDescription: formData.seoDescription,
                seoKeywords: formData.seoKeywords,
                tags: {
                    tagNames: tagNames
                }
            };

            // API requires categoryId as query param
            const result = await createPost(payload, formData.categoryId);
            console.log('Post created:', result);
            alert('Post created successfully!');
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to create post. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container post-form-page">
            <div className="post-form-card">
                <h2>Write New Post</h2>
                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} className="post-form">
                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label htmlFor="title">Title *</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group flex-1">
                            <label htmlFor="categoryId">Category ID *</label>
                            <input
                                type="number"
                                name="categoryId"
                                id="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                                placeholder="ID"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content *</label>
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={handleContentChange}
                            className="content-editor-quill"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="thumbnailUrl">Thumbnail URL</label>
                            <input
                                type="text"
                                name="thumbnailUrl"
                                id="thumbnailUrl"
                                value={formData.thumbnailUrl}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label htmlFor="tags">Tags (comma separated)</label>
                            <input
                                type="text"
                                name="tags"
                                id="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="React, Java, Web"
                            />
                        </div>
                    </div>

                    <details className="seo-details">
                        <summary>SEO Settings</summary>
                        <div className="seo-fields">
                            <div className="form-group">
                                <label htmlFor="seoTitle">SEO Title</label>
                                <input
                                    type="text"
                                    name="seoTitle"
                                    id="seoTitle"
                                    value={formData.seoTitle}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="seoDescription">SEO Description</label>
                                <textarea
                                    name="seoDescription"
                                    id="seoDescription"
                                    value={formData.seoDescription}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="seoKeywords">SEO Keywords</label>
                                <input
                                    type="text"
                                    name="seoKeywords"
                                    id="seoKeywords"
                                    value={formData.seoKeywords}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </details>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? 'Publishing...' : 'Publish Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
