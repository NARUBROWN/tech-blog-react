import { useState, useEffect, useMemo } from 'react';
import { createPost } from '../api/post';
import { getCategoryList } from '../api/category';
import ImageUpload from '../components/ImageUpload';
import { useNavigate } from 'react-router-dom';
import { X, Check, Eye, ChevronDown, Tag as TagIcon } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import './PostForm.css';
import { useAuth } from '../context/AuthContext';
import PostPreviewModal from '../components/PostPreviewModal';

const CreatePost = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
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

    const handlePreview = (e) => {
        e.preventDefault();

        // Basic validation before preview
        if (!formData.title.trim() || !formData.content.trim()) {
            setError('제목과 본문을 입력해 주세요.');
            return;
        }

        if (!formData.categoryId) {
            setError('카테고리를 선택해 주세요.');
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
            alert('글을 발행했습니다.');
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('글을 발행하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.');
            setShowPreview(false); // Close preview on error so user can fix
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-studio">

            <div className="post-studio-shell">
                {error && <div className="form-error" role="alert">{error}</div>}

                <form onSubmit={handlePreview} className="post-studio-form" id="create-post-form">
                    <div className="studio-toolbar">
                        <div className="toolbar-left">
                            <h1 className="toolbar-chip">글쓰기</h1>

                            <button
                                type="button"
                                className="category-chip"
                                onClick={() => setShowCategoryModal(true)}
                            >
                                <span>{selectedCategoryName || '카테고리 선택'}</span>
                                <ChevronDown size={16} />
                            </button>
                        </div>

                        <div className="toolbar-actions">
                            <button type="submit" className="btn-publish" disabled={loading}>
                                <Eye size={16} aria-hidden="true" />
                                {loading ? '발행 중...' : '미리보기'}
                            </button>
                        </div>
                    </div>

                    <div className="studio-grid">
                        <section className="writer-panel">
                            <div className="title-stack">
                                <label className="eyebrow" htmlFor="title">제목</label>
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
                                <RichTextEditor value={formData.content} onChange={handleContentChange} />
                            </div>
                        </section>

                        <aside className="meta-rail">
                            <div className="meta-card highlight-card">
                                <div className="meta-card-header">
                                    <div>
                                        <p className="meta-title">커버 이미지</p>
                                        <span className="meta-subtitle">글 목록에 표시되는 이미지</span>
                                    </div>
                                </div>
                                <ImageUpload
                                    label="커버 이미지"
                                    onUpload={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                                    initialUrl={formData.thumbnailUrl}
                                    className="image-upload-compact"
                                />
                            </div>

                            <div className="meta-card">
                                <div className="meta-card-header">
                                    <div className="meta-title-row">
                                        <TagIcon size={16} />
                                        <label className="meta-title" htmlFor="tags">태그</label>
                                    </div>
                                    <span className="meta-subtitle">쉼표로 구분</span>
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
                                    <p className="meta-title">검색 설정</p>
                                    <span className="meta-subtitle">선택 사항</span>
                                </div>
                                <div className="seo-grid">
                                    <label>검색 제목
                                        <input
                                            type="text"
                                            name="seoTitle"
                                            className="meta-input"
                                            placeholder="검색 결과에 표시할 제목"
                                            value={formData.seoTitle}
                                            onChange={handleChange}
                                        />
                                    </label>
                                    <label>검색 설명
                                        <textarea
                                            name="seoDescription"
                                            className="meta-input"
                                            placeholder="검색 결과에 표시할 짧은 소개"
                                            value={formData.seoDescription}
                                            onChange={handleChange}
                                            rows="3"
                                        />
                                    </label>
                                    <label>검색 키워드
                                        <input
                                            type="text"
                                            name="seoKeywords"
                                            className="meta-input"
                                            placeholder="AI, 백엔드, 개발"
                                            value={formData.seoKeywords}
                                            onChange={handleChange}
                                        />
                                    </label>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <div className="mobile-publish-bar">
                        <span className="toolbar-hint">미리보기에서 확인 후 발행하세요.</span>
                        <button type="submit" className="btn-publish" disabled={loading}>
                            <Eye size={16} aria-hidden="true" />
                                {loading ? '발행 중...' : '미리보기'}
                        </button>
                    </div>
                </form>
            </div>

            {showCategoryModal && (
                <div className="category-modal-overlay">
                    <div className="category-modal" role="dialog" aria-modal="true" aria-label="카테고리 선택">
                        <div className="category-modal-header">
                            <h3>카테고리 선택</h3>
                            <button onClick={() => setShowCategoryModal(false)} className="btn-icon" aria-label="카테고리 선택 닫기">
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
                                <p className="empty-state">등록된 카테고리가 없습니다.</p>
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
