import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostBySlug, likePost, unlikePost, getPostLikes } from '../api/post';
import { useAuth } from '../context/AuthContext';
import UserListModal from '../components/UserListModal';
import RecommendedPosts from '../components/RecommendedPosts';
import { Calendar, User, Tag, Heart, Eye } from 'lucide-react';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
// Configure DOMPurify to allow SVG elements for Mermaid diagrams
DOMPurify.setConfig({
    ADD_TAGS: ['svg', 'path', 'g', 'defs', 'marker', 'style', 'title', 'desc', 'ellipse', 'line', 'polygon', 'polyline', 'rect', 'text', 'tspan', 'use', 'symbol', 'foreignObject', 'circle'],
    ADD_ATTR: ['class', 'style', 'stroke', 'stroke-width', 'fill', 'd', 'viewBox', 'xmlns', 'x', 'y', 'width', 'height', 'transform', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'font-family', 'font-size', 'text-anchor', 'dominant-baseline', 'alignment-baseline', 'preserveAspectRatio', 'xmlns:xlink', 'xlink:href']
});
import mermaid from 'mermaid';
import './PostDetail.css';

// Memoized component for Post Content to prevent re-rendering Mermaid on modal open
const PostContent = memo(({ content }) => {
    useEffect(() => {
        if (!content) return;

        // Initialize Mermaid without auto-start
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
        });

        const renderMermaid = async () => {
            const isMermaidDefinition = (text) =>
                text.match(/^(graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline)/);

            let renderIndex = 0;

            const renderAndReplace = async (textChunk, nodesToReplace) => {
                const id = `mermaid-${renderIndex++}-${Date.now()}`;
                try {
                    const { svg } = await mermaid.render(id, textChunk);
                    const div = document.createElement('div');
                    div.className = 'mermaid-diagram';
                    div.innerHTML = svg;

                    const firstNode = nodesToReplace[0];
                    const parent = firstNode?.parentNode;
                    if (parent) {
                        parent.insertBefore(div, firstNode);
                        nodesToReplace.forEach(node => parent.removeChild(node));
                    }
                } catch (error) {
                    console.error('Mermaid rendering error for block:', renderIndex - 1, error);
                    nodesToReplace.forEach(node => node.classList?.add('mermaid-error'));
                }
            };

            // Standard <pre> blocks
            const preBlocks = document.querySelectorAll('.post-body-text pre');
            for (const block of preBlocks) {
                const blockContent = block.textContent.trim();
                if (isMermaidDefinition(blockContent)) {
                    await renderAndReplace(blockContent, [block]);
                }
            }

            // Quill code blocks
            const quillBlocks = document.querySelectorAll('.post-body-text .ql-code-block');
            const visited = new Set();
            for (const block of quillBlocks) {
                if (visited.has(block)) continue;

                const nodesToReplace = [];
                let current = block;
                while (current && current.classList.contains('ql-code-block')) {
                    visited.add(current);
                    nodesToReplace.push(current);
                    current = current.nextElementSibling;
                }

                const blockContent = nodesToReplace.map(node => node.textContent).join('\n').trim();
                if (isMermaidDefinition(blockContent)) {
                    await renderAndReplace(blockContent, nodesToReplace);
                }
            }

            // Plain paragraphs
            const container = document.querySelector('.post-body-text');
            if (container) {
                const children = Array.from(container.children);
                for (let i = 0; i < children.length; i++) {
                    const node = children[i];
                    if (!(node.tagName === 'P')) continue;

                    const firstLine = node.textContent.trim();
                    if (!isMermaidDefinition(firstLine)) continue;

                    const nodesToReplace = [node];
                    const contentLines = [firstLine];

                    let j = i + 1;
                    while (j < children.length) {
                        const next = children[j];
                        if (!(next.tagName === 'P')) break;

                        const text = next.textContent;
                        if (!text || text.trim() === '') {
                            nodesToReplace.push(next);
                            j++;
                            break;
                        }

                        contentLines.push(text);
                        nodesToReplace.push(next);
                        j++;
                    }

                    const blockContent = contentLines.join('\n').trim();
                    if (isMermaidDefinition(blockContent)) {
                        await renderAndReplace(blockContent, nodesToReplace);
                        i = j - 1;
                    }
                }
            }
        };

        // Small delay to ensure DOM is ready
        setTimeout(renderMermaid, 100);

    }, [content]);

    return (
        <div className="post-content-wrapper">
            <div
                className="post-body-text"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
        </div>
    );
});

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

    if (loading) return <div className="loading-state">Loading...</div>;
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
                                {/* Placeholder for share/bookmark actions */}
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
