import { useState, useEffect, useMemo, useRef } from 'react';
import { createPost } from '../api/post';
import { getCategoryList } from '../api/category';
import { uploadImage } from '../api/image';
import ImageUpload from '../components/ImageUpload';
import { useNavigate } from 'react-router-dom';
import { X, Check, Sparkles, Clock3, ChevronDown, Tag as TagIcon } from 'lucide-react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './PostForm.css';
import { useAuth } from '../context/AuthContext';
import PostPreviewModal from '../components/PostPreviewModal';

const CreatePost = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isQuillReady, setIsQuillReady] = useState(false);
    const [error, setError] = useState('');
    const quillRef = useRef(null);

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
    const [showPreview, setShowPreview] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const tagList = useMemo(
        () => formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        [formData.tags]
    );

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

    useEffect(() => {
        const loadQuillModules = async () => {
            if (typeof window !== 'undefined' && !window.Quill) {
                window.Quill = Quill;
            }

            try {
                // Dynamically import image resize module
                const ImageResizeModule = await import('quill-image-resize-module-react');
                // Check if it's already registered to avoid re-registration errors
                if (!Quill.imports['modules/imageResize']) {
                    Quill.register('modules/imageResize', ImageResizeModule.default);
                }
                setIsQuillReady(true);
            } catch (error) {
                console.error("Failed to load Quill modules", error);
                // Even if it fails, we should let the editor load without the module or show error
                setIsQuillReady(true); // Fallback to let editor load
            }
        };

        loadQuillModules();
    }, []);

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
        'list', 'indent',
        'link', 'image'
    ];

    const handlePreview = (e) => {
        e.preventDefault();

        // Basic validation before preview
        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Please enter a title and content.');
            return;
        }

        if (!formData.categoryId) {
            setError('Please select a category.');
            return;
        }

        setError('');
        setShowPreview(true);
    };

    const handleConfirmPublish = async () => {
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
            setShowPreview(false); // Close preview on error so user can fix
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-studio">
            <div className="studio-ambient" aria-hidden="true"></div>

            <div className="post-studio-shell">
                {error && <div className="form-error">{error}</div>}

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handlePreview} className="post-studio-form" id="create-post-form">
                    <div className="studio-toolbar">
                        <div className="toolbar-left">
                            <div className="toolbar-chip">
                                <Sparkles size={16} />
                                <span>Writing Studio</span>
                            </div>

                            <button
                                type="button"
                                className="category-chip"
                                onClick={() => setShowCategoryModal(true)}
                            >
                                <span>{selectedCategoryName || '카테고리 선택'}</span>
                                <ChevronDown size={16} />
                            </button>

                            <div className="toolbar-meta">
                                <Clock3 size={14} />
                                <span>초안 모드</span>
                            </div>
                        </div>

                        <div className="toolbar-actions">
                            <span className="toolbar-hint">미리보기 후 발행할 수 있어요</span>
                            <button type="submit" className="btn-publish" disabled={loading}>
                                {loading ? 'Publishing...' : 'Publish'}
                            </button>
                        </div>
                    </div>

                    <div className="studio-grid">
                        <section className="writer-panel">
                            <div className="title-stack">
                                <div className="eyebrow">새 포스트</div>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    className="post-title-input"
                                    placeholder="제목을 입력하세요"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="title-hint">
                                    이미지는 에디터 상단의 아이콘으로 업로드할 수 있어요.
                                </p>
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
                                        placeholder="Tell your story..."
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
                                        <p className="meta-title">커버 이미지</p>
                                        <span className="meta-subtitle">글의 첫 인상을 만들어요</span>
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
                                        <p className="meta-title">태그</p>
                                    </div>
                                    <span className="meta-subtitle">콤마로 구분</span>
                                </div>
                                <input
                                    type="text"
                                    name="tags"
                                    id="tags"
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
                                    <span className="meta-subtitle">검색 노출 메타데이터</span>
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

                    <div className="mobile-publish-bar">
                        <span className="toolbar-hint">작성한 내용이 마음에 들면 발행하세요.</span>
                        <button type="submit" className="btn-publish" disabled={loading}>
                            {loading ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </form>
            </div>

            {showCategoryModal && (
                <div className="category-modal-overlay">
                    <div className="category-modal">
                        <div className="category-modal-header">
                            <h3>Select Category</h3>
                            <button onClick={() => setShowCategoryModal(false)} className="btn-icon">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="category-modal-body">
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

            <PostPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                onPublish={handleConfirmPublish}
                data={{
                    ...formData,
                    categoryName: selectedCategoryName
                }}
                isPublishing={loading}
                author={user}
            />
        </div>
    );
};

export default CreatePost;
