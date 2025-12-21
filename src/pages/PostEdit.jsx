import { useState, useEffect, useMemo, useRef } from 'react';
import { getPostById, updatePost } from '../api/post';
import { uploadImage } from '../api/image';
import ImageUpload from '../components/ImageUpload';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, Clock3, Tag as TagIcon, User, Calendar, Save } from 'lucide-react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './PostForm.css'; // Reusing the same CSS
import { format } from 'date-fns';

const PostEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isQuillReady, setIsQuillReady] = useState(false);
    const [error, setError] = useState('');
    const quillRef = useRef(null);

    const [originalPost, setOriginalPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        thumbnailUrl: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        tags: '' // Comma separated string for UI
    });

    const tagList = useMemo(
        () => formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        [formData.tags]
    );

    useEffect(() => {
        const loadQuillModules = async () => {
            if (typeof window !== 'undefined' && !window.Quill) {
                window.Quill = Quill;
            }

            try {
                const { default: BlotFormatter } = await import('quill-blot-formatter');
                if (!Quill.imports['modules/blotFormatter']) {
                    Quill.register('modules/blotFormatter', BlotFormatter);
                }
                setIsQuillReady(true);
            } catch (error) {
                console.error("Failed to load Quill modules", error);
                setIsQuillReady(true);
            }
        };

        loadQuillModules();
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const data = await getPostById(id);
                setOriginalPost(data);

                // Populate form data
                setFormData({
                    title: data.title || '',
                    content: data.content || '',
                    thumbnailUrl: data.thumbnailUrl || '',
                    seoTitle: data.seoTitle || '',
                    seoDescription: data.seoDescription || '',
                    seoKeywords: data.seoKeywords || '',
                    tags: data.tags?.tagNames?.join(', ') || ''
                });
            } catch (err) {
                console.error('Failed to load post for editing:', err);
                setError('Failed to load post data.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

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
            blotFormatter: {}
        };
    }, []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent',
        'link', 'image'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Please enter a title and content.');
            return;
        }

        setSaving(true);
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

            // Using originalPost.category.id and originalPost.id
            if (!originalPost?.category?.id) {
                throw new Error("Category ID is missing");
            }

            const result = await updatePost(originalPost.category.id, originalPost.id, payload);
            alert('Post updated successfully!');
            if (result && result.slug) {
                navigate(`/post/${result.slug}`);
            } else {
                navigate(`/post/${originalPost.id}`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update post.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="post-studio"><div className="editor-loading">Loading post...</div></div>;
    if (error) return <div className="post-studio"><div className="form-error">{error}</div></div>;

    return (
        <div className="post-studio">
            <div className="studio-ambient" aria-hidden="true"></div>

            <div className="post-studio-shell">
                <form onSubmit={handleSubmit} className="post-studio-form">
                    <div className="studio-toolbar">
                        <div className="toolbar-left">
                            <div className="toolbar-chip">
                                <Sparkles size={16} />
                                <span>Editing Studio</span>
                            </div>

                            {/* Read-only Category Display */}
                            <div className="category-chip static">
                                <span>{originalPost?.category?.name || 'Uncategorized'}</span>
                            </div>

                            <div className="toolbar-meta">
                                <Clock3 size={14} />
                                <span>Edit Mode</span>
                            </div>
                        </div>

                        <div className="toolbar-actions">
                            <button type="submit" className="btn-publish" disabled={saving}>
                                <Save size={16} style={{ marginRight: '6px' }} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    <div className="studio-grid">
                        <section className="writer-panel">
                            {/* Read-only Meta Info */}
                            {originalPost && (
                                <div className="post-read-only-meta">
                                    <div className="meta-item">
                                        <User size={14} />
                                        <span>Author: <strong>{originalPost.author?.username || 'Unknown'}</strong></span>
                                    </div>
                                    <div className="meta-item">
                                        <Calendar size={14} />
                                        <span>Published: <strong>{originalPost.publishedAt ? format(new Date(originalPost.publishedAt), 'MMM dd, yyyy') : 'Draft'}</strong></span>
                                    </div>
                                </div>
                            )}

                            <div className="title-stack">
                                <input
                                    type="text"
                                    name="title"
                                    className="post-title-input"
                                    placeholder="Title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="editor-shell">
                                {isQuillReady ? (
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={formData.content}
                                        onChange={handleContentChange}
                                        className="content-editor-quill"
                                        modules={modules}
                                        formats={formats}
                                        placeholder="Write something amazing..."
                                    />
                                ) : (
                                    <div className="editor-loading">Loading Editor...</div>
                                )}
                            </div>
                        </section>

                        <aside className="meta-rail">
                            <div className="meta-card highlight-card">
                                <div className="meta-card-header">
                                    <div>
                                        <p className="meta-title">Cover Image</p>
                                    </div>
                                </div>
                                <ImageUpload
                                    label="Cover image"
                                    onUpload={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                                    initialUrl={formData.thumbnailUrl}
                                    className="image-upload-compact"
                                />
                            </div>

                            <div className="meta-card">
                                <div className="meta-card-header">
                                    <div className="meta-title-row">
                                        <TagIcon size={16} />
                                        <p className="meta-title">Tags</p>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    name="tags"
                                    className="meta-input"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="React, Java, Web"
                                />
                                {tagList.length > 0 && (
                                    <div className="tag-preview">
                                        {tagList.map((tag, index) => (
                                            <span key={`${tag}-${index}`} className="tag-chip">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="meta-card">
                                <div className="meta-card-header">
                                    <p className="meta-title">SEO</p>
                                </div>
                                <div className="seo-grid">
                                    <input
                                        type="text"
                                        name="seoTitle"
                                        className="meta-input"
                                        placeholder="SEO Title"
                                        value={formData.seoTitle}
                                        onChange={handleChange}
                                    />
                                    <textarea
                                        name="seoDescription"
                                        className="meta-input"
                                        placeholder="SEO Description"
                                        value={formData.seoDescription}
                                        onChange={handleChange}
                                        rows="3"
                                    />
                                    <input
                                        type="text"
                                        name="seoKeywords"
                                        className="meta-input"
                                        placeholder="SEO Keywords"
                                        value={formData.seoKeywords}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </aside>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostEdit;
