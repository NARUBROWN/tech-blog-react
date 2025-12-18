import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostBySlug, likePost, unlikePost, getPostLikes, deletePost } from '../api/post';
import { useAuth } from '../context/AuthContext';
import UserListModal from '../components/UserListModal';
import RecommendedPosts from '../components/RecommendedPosts';
import { Calendar, User, Tag, Heart, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import PostContent from '../components/PostContent';
import './PostDetail.css';
import PostDetailSkeleton from '../components/PostDetailSkeleton';



const PostDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [likers, setLikers] = useState([]);
    const [isLikeModalOpen, setIsLikeModalOpen] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await getPostBySlug(slug);
                setPost(data);
                setIsLiked(data.liked);
                setLikeCount(data.likeCount || 0);
            } catch (err) {
                console.error(err);
                setError('Failed to load post.');
            } finally {
                setLoading(false);
            }
        };

        const fetchLikers = async () => {
            if (!slug || !post?.id) return;
            try {
                const likersData = await getPostLikes(post.id);
                setLikers(likersData);
                setLikeCount(likersData.length);
                if (user) {
                    setIsLiked(likersData.some(u => u.username === user.username));
                }
            } catch (error) {
                console.error("Failed to fetch likes", error);
            }
        };

        if (slug) fetchPost();
    }, [slug]);

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
        const canonicalUrl = `https://na2ru2.me/post/${post.slug || slug}`;
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
    }, [post, slug]);

    const handleLikeToggle = async () => {
        if (!user) {
            alert('Please login to like posts');
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
        if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            await deletePost(post.id);
            navigate('/');
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post.');
        }
    };

    if (loading) return <PostDetailSkeleton />;
    if (error) return <div className="error-state">{error}</div>;
    if (!post) return <div className="error-state">Post not found</div>;

    return (
        <>
            <article className="post-detail-container">
                {/* 1. Thumbnail (Twitter Banner Style) */}
                {post.thumbnailUrl && (
                    <div className="post-featured-image-banner">
                        <img src={post.thumbnailUrl} alt={post.title} />
                    </div>
                )}

                <header className="post-header-wrapper">
                    <div className="post-header-content">
                        {/* 2. Category */}
                        <span className="post-category-badge">{post.category?.name || 'Uncategorized'}</span>

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
                                            {post.publishedAt ? format(new Date(post.publishedAt), 'MMM dd, yyyy') : 'Draft'}
                                        </span>
                                        <span className="dot-divider">·</span>
                                        <span className="read-time">5 min read</span>
                                    </div>
                                </div>
                            </div>
                            <div className="header-actions">
                                {(user && post.author && (user.username === post.author.username || user.role === 'ROLE_ADMIN')) && (
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={handleDelete}
                                        title="Delete Post"
                                        style={{ color: '#ef4444' }} // Simple inline style for danger color, or move to CSS
                                    >
                                        <Trash2 size={20} />
                                    </button>
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
                                aria-label={isLiked ? "Unlike post" : "Like post"}
                            >
                                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                            </button>
                            <button
                                className="like-count-btn"
                                onClick={() => setIsLikeModalOpen(true)}
                                aria-label="View who liked this post"
                            >
                                <span>{likeCount}</span>
                            </button>
                        </div>
                        <div className="interaction-group">
                            <div className="stat-display">
                                <Eye size={20} />
                                <span>{post.viewCount} reads</span>
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
                            <p className="bio-description">{post.author?.bio || "Tech enthusiast and writer."}</p>
                        </div>
                    </div>
                </footer>

                <RecommendedPosts currentPostId={post.id} />
            </article>

            <UserListModal
                isOpen={isLikeModalOpen}
                onClose={() => setIsLikeModalOpen(false)}
                title="Likes"
                users={likers}
            />
        </>
    );
};

export default PostDetail;
