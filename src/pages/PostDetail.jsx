import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getPostBySlug, getPostById, likePost, unlikePost, getPostLikes, deletePost, increasePostViewCount } from '../api/post';
import { useAuth } from '../context/AuthContext';
import UserListModal from '../components/UserListModal';
import RecommendedPosts from '../components/RecommendedPosts';
import { ArrowLeft, User, Heart, Eye, Trash2, Share2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import PostContent from '../components/PostContent';
import RecruitmentSnackbar from '../components/RecruitmentSnackbar';
import './PostDetail.css';
import PostDetailSkeleton from '../components/PostDetailSkeleton';



const PostDetail = () => {
    const { slug, id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [likers, setLikers] = useState([]);
    const [isLikeModalOpen, setIsLikeModalOpen] = useState(false);
    const [showRecruitment, setShowRecruitment] = useState(false);
    const [isRecruitmentDismissed, setIsRecruitmentDismissed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (isRecruitmentDismissed) return;

            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

            if (scrollPercentage >= 0.7) {
                setShowRecruitment(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isRecruitmentDismissed]);

    useEffect(() => {
        if (!slug && !id) return;
        const controller = new AbortController();
        let isCancelled = false;

        const fetchPost = async () => {
            setLoading(true);
            try {
                let data;
                if (id) {
                    data = await getPostById(id, { signal: controller.signal });
                } else {
                    data = await getPostBySlug(slug, { signal: controller.signal });
                }

                if (!data || isCancelled) return;

                if (data && data.id) {
                    const STORAGE_KEY = `post_view_${data.id}`;
                    const lastViewed = localStorage.getItem(STORAGE_KEY);
                    const now = Date.now();
                    const SIX_HOURS = 6 * 60 * 60 * 1000;

                    if (!lastViewed || (now - parseInt(lastViewed) > SIX_HOURS)) {
                        increasePostViewCount(data.id).catch(e => console.error("Failed to update view count", e));
                        localStorage.setItem(STORAGE_KEY, now.toString());
                        data = { ...data, viewCount: (data.viewCount || 0) + 1 };
                    }
                }
                setPost(data);
                setIsLiked(Boolean(data.liked));
                setLikeCount(data.likeCount || 0);
                setError('');
            } catch (err) {
                if (controller.signal.aborted || err.code === 'ERR_CANCELED') return;
                console.error(err);
                setError('글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchPost();

        return () => {
            isCancelled = true;
            controller.abort();
        };
    }, [slug, id]);

    useEffect(() => {
        if (post?.id) {
            const updateLikeState = async () => {
                try {
                    const likersData = await getPostLikes(post.id);
                    setLikers(likersData);
                    setLikeCount(likersData.length);
                    if (user) {
                        setIsLiked(likersData.some(u => u.username === user.username));
                    } else {
                        setIsLiked(false);
                    }
                } catch (error) {
                    console.error("Failed to fetch likes", error);
                }
            }
            updateLikeState();
        }
    }, [post?.id, user]);

    useEffect(() => {
        if (!post) return;

        const siteName = 'NARUBROWN의 기술 블로그';
        const defaultTitle = document.title || siteName;
        const plainText = (html) => (html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '');
        const getAbsoluteUrl = (url) => {
            if (!url) return null;
            try {
                return new URL(url, window.location.origin).toString();
            } catch (error) {
                console.error('Failed to normalize URL for SEO metadata', error);
                return null;
            }
        };

        const metaTitle = (post.seoTitle?.trim() || post.title || siteName).trim();
        const fullTitle = `${metaTitle} | ${siteName}`;
        const descriptionSource = post.seoDescription?.trim() || plainText(post.content);
        const description = descriptionSource
            ? (descriptionSource.length > 160 ? `${descriptionSource.slice(0, 157)}...` : descriptionSource)
            : siteName;
        const keywords = (post.seoKeywords || post.tags?.tagNames?.join(', ') || '').trim();
        const canonicalUrl = `https://na2ru2.me/post/${post.slug || slug || id}`;
        const fallbackOgImage = 'https://na2ru2.me/logo.png';
        const ogImage = getAbsoluteUrl(post.thumbnailUrl) || fallbackOgImage;

        const createdMeta = [];
        const previousMetaContent = new Map();

        const upsertMeta = (attr, key, value) => {
            if (!value) return;
            let element = document.querySelector(`meta[${attr}="${key}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, key);
                document.head.appendChild(element);
                createdMeta.push(element);
            } else {
                previousMetaContent.set(element, element.getAttribute('content'));
            }
            element.setAttribute('content', value);
        };

        const metaDefinitions = [
            { attr: 'name', key: 'description', value: description },
            { attr: 'name', key: 'keywords', value: keywords },
            { attr: 'name', key: 'author', value: post.author?.username },
            { attr: 'name', key: 'robots', value: 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1' },
            { attr: 'property', key: 'og:title', value: fullTitle },
            { attr: 'property', key: 'og:description', value: description },
            { attr: 'property', key: 'og:type', value: 'article' },
            { attr: 'property', key: 'og:site_name', value: siteName },
            { attr: 'property', key: 'og:url', value: canonicalUrl },
            { attr: 'property', key: 'og:image', value: ogImage },
            { attr: 'property', key: 'og:locale', value: 'ko_KR' },
            { attr: 'property', key: 'article:published_time', value: post.publishedAt },
            { attr: 'property', key: 'article:section', value: post.category?.name },
            { attr: 'name', key: 'twitter:card', value: 'summary_large_image' },
            { attr: 'name', key: 'twitter:title', value: fullTitle },
            { attr: 'name', key: 'twitter:description', value: description },
            { attr: 'name', key: 'twitter:image', value: ogImage }
        ];

        metaDefinitions.forEach(meta => upsertMeta(meta.attr, meta.key, meta.value));

        const existingCanonical = document.querySelector('link[rel="canonical"]');
        const canonicalCreated = !existingCanonical;
        const previousCanonicalHref = existingCanonical?.getAttribute('href') || '';
        const canonicalLink = existingCanonical || document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', canonicalUrl);
        if (canonicalCreated) {
            document.head.appendChild(canonicalLink);
        }

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": metaTitle,
            "name": metaTitle,
            "description": description,
            "inLanguage": "ko-KR",
            "url": canonicalUrl,
            "mainEntityOfPage": canonicalUrl,
            "datePublished": post.publishedAt,
            "dateModified": post.updatedAt || post.publishedAt,
            "image": ogImage ? [ogImage] : undefined,
            "author": post.author ? {
                "@type": "Person",
                "name": post.author.username,
                "url": canonicalUrl
            } : undefined,
            "publisher": {
                "@type": "Organization",
                "name": siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": fallbackOgImage
                }
            },
            "keywords": keywords || undefined,
            "articleSection": post.category?.name
        };

        const structuredDataJson = JSON.stringify(structuredData, (_, value) => value === undefined ? undefined : value);
        const existingLd = document.getElementById('post-structured-data');
        const ldCreated = !existingLd;
        const previousLdContent = existingLd?.textContent || '';
        const ldScript = existingLd || document.createElement('script');
        ldScript.type = 'application/ld+json';
        ldScript.id = 'post-structured-data';
        ldScript.textContent = structuredDataJson;
        if (ldCreated) {
            document.head.appendChild(ldScript);
        }

        document.title = fullTitle;

        return () => {
            document.title = defaultTitle;

            createdMeta.forEach(meta => meta.remove());
            previousMetaContent.forEach((content, meta) => {
                if (content) {
                    meta.setAttribute('content', content);
                } else {
                    meta.removeAttribute('content');
                }
            });

            if (canonicalCreated) {
                canonicalLink.remove();
            } else if (previousCanonicalHref) {
                canonicalLink.setAttribute('href', previousCanonicalHref);
            } else {
                canonicalLink.removeAttribute('href');
            }

            if (ldCreated) {
                ldScript.remove();
            } else {
                ldScript.textContent = previousLdContent;
            }
        };
    }, [post, slug, id]);

    const handleLikeToggle = async () => {
        if (!user) {
            alert('좋아요를 누르려면 로그인해 주세요.');
            return;
        }

        if (!post) return;

        const previousLiked = isLiked;
        const previousCount = likeCount;

        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            if (previousLiked) {
                await unlikePost(post.id);
            } else {
                await likePost(post.id);
            }

            const freshLikers = await getPostLikes(post.id);
            setLikers(freshLikers);
            setLikeCount(freshLikers.length);
        } catch (error) {
            console.error('Failed to toggle like:', error);
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('이 글을 삭제하시겠습니까? 삭제한 글은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            await deletePost(post.id);
            navigate('/');
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('글을 삭제하지 못했습니다. 다시 시도해 주세요.');
        }
    };

    const handleShare = async () => {
        if (!post) return;
        const shareUrl = `${window.location.origin}/post/share/${post.id}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('글 링크를 복사했습니다.');
        } catch (err) {
            console.error('Failed to copy link:', err);
            alert('링크를 복사하지 못했습니다. 다시 시도해 주세요.');
        }
    };

    if (loading) return <PostDetailSkeleton />;
    if (error || !post) return <div className="post-detail-state"><p>{error || '글을 찾을 수 없습니다.'}</p><Link to="/">홈으로 돌아가기</Link></div>;

    return (
        <>
            <article className="post-detail-container">
                <Link to="/" className="post-back-link"><ArrowLeft size={16} aria-hidden="true" /> 전체 글</Link>
                {/* 1. Thumbnail (Twitter Banner Style) */}
                {post.thumbnailUrl && (
                    <div className="post-featured-image-banner">
                        <img src={post.thumbnailUrl} alt={post.title} />
                    </div>
                )}

                <header className="post-header-wrapper">
                    <div className="post-header-content">
                        {/* 2. Category */}
                        <span className="post-category-badge">{post.category?.name || '글'}</span>

                        {/* 3. Title */}
                        <h1 className="post-main-title">{post.title}</h1>

                        {/* 4. Profile */}
                        <div className="post-meta-row">
                            <div className="author-layout">
                                {post.author?.profileImageUrl ? (
                                    <img src={post.author.profileImageUrl} alt={post.author.username} className="author-img" />
                                ) : (
                                    <div className="author-placeholder"><User size={20} /></div>
                                )}
                                <div className="author-details">
                                    <span className="author-username">{post.author?.username}</span>
                                    <div className="meta-sub">
                                        <span className="post-date">
                                            {post.publishedAt ? format(new Date(post.publishedAt), 'yyyy.MM.dd') : '임시 저장'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="header-actions">
                                <button
                                    className="action-btn share-btn"
                                    onClick={handleShare}
                                    title="공유하기"
                                    aria-label="글 공유하기"
                                >
                                    <Share2 size={20} />
                                </button>
                                {(user && post.author && (user.username === post.author.username || user.role === 'ROLE_ADMIN')) && (
                                    <>
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => navigate(`/post/edit/${post.id}`)}
                                            title="글 수정"
                                            aria-label="글 수정"
                                        >
                                            <Pencil size={20} />
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={handleDelete}
                                            title="글 삭제"
                                            aria-label="글 삭제"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content (Memoized) */}
                <PostContent content={post.content} />

                <footer className="post-footer-wrapper">
                    <div className="post-tags-list">
                        {post.tags?.tagNames?.map((tag, index) => (
                            <span key={index} className="post-tag-chip">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="post-interaction-bar">
                        <div className="interaction-group">
                            <button
                                className={`interaction-btn like-btn ${isLiked ? 'active' : ''}`}
                                onClick={handleLikeToggle}
                                aria-label={isLiked ? "좋아요 취소" : "좋아요"}
                                aria-pressed={isLiked}
                            >
                                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                            </button>
                            <button
                                className="like-count-btn"
                                onClick={() => setIsLikeModalOpen(true)}
                                aria-label="좋아요 누른 사람 보기"
                            >
                                <span>{likeCount}</span>
                            </button>
                        </div>
                        <div className="interaction-group">
                            <div className="stat-display">
                                <Eye size={20} />
                                <span>{post.viewCount}명 읽음</span>
                            </div>
                        </div>
                    </div>

                    <div className="post-author-bio-card">
                        <div className="bio-avatar">
                            {post.author?.profileImageUrl ? (
                                <img src={post.author.profileImageUrl} alt={post.author.username} />
                            ) : (
                                <User size={40} />
                            )}
                        </div>
                        <div className="bio-content">
                            <h3 className="bio-name">{post.author?.username}</h3>
                            {post.author?.bio && <p className="bio-description">{post.author.bio}</p>}
                        </div>
                    </div>
                </footer>

                <RecommendedPosts currentPostId={post.id} />
            </article>

            <UserListModal
                isOpen={isLikeModalOpen}
                onClose={() => setIsLikeModalOpen(false)}
                title="좋아요"
                users={likers}
            />

            <RecruitmentSnackbar
                isVisible={showRecruitment}
                onClose={() => {
                    setShowRecruitment(false);
                    setIsRecruitmentDismissed(true);
                }}
            />
        </>
    );
};

export default PostDetail;
