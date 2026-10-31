import { useState, useEffect, useMemo } from 'react';
import { getPostById, updatePost } from '../api/post';
import ImageUpload from '../components/ImageUpload';
import { useNavigate, useParams } from 'react-router-dom';
import { Tag as TagIcon, User, Calendar, Save } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import './PostForm.css'; // Reusing the same CSS
import { formatPostDate } from '../utils/postDate';

const PostEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

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
                setError('글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            alert('제목과 본문을 입력해 주세요.');
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
            alert('글을 수정했습니다.');
            if (result && result.slug) {
                navigate(`/post/${result.slug}`);
            } else {
                navigate(`/post/${originalPost.id}`);
            }
        } catch (err) {
            console.error(err);
            alert('글을 수정하지 못했습니다. 다시 시도해 주세요.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="post-studio"><div className="editor-loading">글을 불러오는 중...</div></div>;
    if (error) return <div className="post-studio"><div className="form-error">{error}</div></div>;

    return (
        <div className="post-studio">

            <div className="post-studio-shell">
                <form onSubmit={handleSubmit} className="post-studio-form">
                    <div className="studio-toolbar">
                        <div className="toolbar-left">
                            <h1 className="toolbar-chip">글 수정</h1>

                            {/* Read-only Category Display */}
                            <div className="category-chip static">
                                <span>{originalPost?.category?.name || '미분류'}</span>
                            </div>


                        </div>

                        <div className="toolbar-actions">
                            <button type="submit" className="btn-publish" disabled={saving}>
                                <Save size={16} aria-hidden="true" />
                                {saving ? '저장 중...' : '수정 저장'}
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
                                        <span>작성자: <strong>{originalPost.author?.username || '알 수 없음'}</strong></span>
                                    </div>
                                    <div className="meta-item">
                                        <Calendar size={14} />
                                        <span>발행일: <strong>{formatPostDate(originalPost.publishedAt, originalPost.publishedAt ? '날짜 정보 없음' : '미발행')}</strong></span>
                                    </div>
                                </div>
                            )}

                            <div className="title-stack">
                                <input
                                    type="text"
                                    name="title"
                                    className="post-title-input"
                                    placeholder="제목을 입력하세요"
                                    aria-label="제목"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
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
                                        <p className="meta-title">태그</p>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    name="tags"
                                    aria-label="태그"
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
                </form>
            </div>
        </div>
    );
};

export default PostEdit;
