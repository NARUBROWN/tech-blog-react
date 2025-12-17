import { useState, useEffect, useMemo, useRef } from 'react';
import { createPost } from '../api/post';
import { getCategoryList } from '../api/category';
import { uploadImage } from '../api/image';
import ImageUpload from '../components/ImageUpload';
import { useNavigate } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import './PostForm.css';

Quill.register('modules/imageResize', ImageResize);

const CreatePost = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const quillRef = useRef(null);
    const imageRef = useRef(null);

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

    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoryList();
                setCategories(data);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        };

        if (showCategoryModal && categories.length === 0) {
            fetchCategories();
        }
    }, [showCategoryModal, categories.length]);

    const handleCategorySelect = (category) => {
        setFormData(prev => ({ ...prev, categoryId: category.id }));
        setSelectedCategoryName(category.name);
        setShowCategoryModal(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    const result = await uploadImage(file);
                    const range = quillRef.current.getEditor().getSelection(true);
                    quillRef.current.getEditor().insertEmbed(range.index, 'image', result.url);
                } catch (error) {
                    console.error('Image upload failed:', error);
                    alert('Image upload failed');
                }
            }
        };
    };

    const modules = useMemo(() => {
        return {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                    ['link', 'image'],
                    ['clean'],
                    ['mermaid']
                ],
                handlers: {
                    'image': imageHandler,
                    'mermaid': function () {
                        const cursorPosition = this.quill.getSelection().index;
                        this.quill.insertText(cursorPosition, 'graph TD;\n  A-->B;', 'code-block', true);
                        this.quill.setSelection(cursorPosition + 20);
                    }
                }
            },
            imageResize: {
                parchment: Quill.import('parchment'),
                modules: ['Resize', 'DisplaySize']
            }
        };
    }, []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

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
                            <label htmlFor="categoryId">Category *</label>
                            <div className="category-select-container">
                                <input
                                    type="text"
                                    value={selectedCategoryName || (formData.categoryId ? `ID: ${formData.categoryId}` : '')}
                                    readOnly
                                    placeholder="Select a category"
                                    onClick={() => setShowCategoryModal(true)}
                                    className="category-input-readonly"
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setShowCategoryModal(true)}
                                >
                                    Select
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content *</label>
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={formData.content}
                            onChange={handleContentChange}
                            className="content-editor-quill"
                            modules={modules}
                            formats={formats}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <ImageUpload
                                label="Thumbnail Image"
                                onUpload={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                                initialUrl={formData.thumbnailUrl}
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

            {showCategoryModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Select Category</h3>
                            <button onClick={() => setShowCategoryModal(false)} className="btn-icon">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {categories.length > 0 ? (
                                <div className="category-list">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            className={`category-option ${formData.categoryId === cat.id ? 'selected' : ''}`}
                                            onClick={() => handleCategorySelect(cat)}
                                        >
                                            <span>{cat.name}</span>
                                            {formData.categoryId === cat.id && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-state">No categories found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePost;
