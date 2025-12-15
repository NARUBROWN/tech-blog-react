import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostBySlug, likePost, unlikePost } from '../api/post';
import { useAuth } from '../context/AuthContext';
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

const PostDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await getPostBySlug(slug);
                setPost(data);
                setIsLiked(data.liked); // Assuming backend returns 'liked' boolean
                setLikeCount(data.likeCount || 0);
            } catch (err) {
                console.error(err);
                setError('Failed to load post.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPost();
    }, [slug]);

    useEffect(() => {
        if (!post?.content) return;

        // Initialize Mermaid without auto-start; we'll render manually after sanitizing content
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
        });

        const renderMermaid = async () => {
            const isMermaidDefinition = (content) =>
                content.match(/^(graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline)/);

            let renderIndex = 0;

            const renderAndReplace = async (content, nodesToReplace) => {
                const id = `mermaid-${renderIndex++}-${Date.now()}`;
                try {
                    const { svg } = await mermaid.render(id, content);
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

            // Standard <pre> blocks (e.g., when pasted markdown)
            const preBlocks = document.querySelectorAll('.post-body-text pre');
            for (const block of preBlocks) {
                const content = block.textContent.trim();
                if (isMermaidDefinition(content)) {
                    await renderAndReplace(content, [block]);
                }
            }

            // Quill outputs each code line as individual .ql-code-block nodes; group consecutive lines
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

                const content = nodesToReplace.map(node => node.textContent).join('\n').trim();
                if (isMermaidDefinition(content)) {
                    await renderAndReplace(content, nodesToReplace);
                }
            }

            // Plain paragraph fallback (users may type Mermaid as normal text instead of code blocks)
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
                        // Stop at empty paragraph (often a blank line)
                        if (!text || text.trim() === '') {
                            nodesToReplace.push(next);
                            j++;
                            break;
                        }

                        contentLines.push(text);
                        nodesToReplace.push(next);
                        j++;
                    }

                    const content = contentLines.join('\n').trim();
                    if (isMermaidDefinition(content)) {
                        await renderAndReplace(content, nodesToReplace);
                        i = j - 1; // Skip over nodes we just processed
                    }
                }
            }
        };

        // Small delay to ensure DOM is ready after sanitization
        setTimeout(renderMermaid, 100);

    }, [post]);

    const handleLikeToggle = async () => {
        if (!user) {
            alert('Please login to like posts');
            // navigate('/login'); // Optional: redirect to login
            return;
        }

        if (!post) return;

        // Optimistic update
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
        } catch (error) {
            console.error('Failed to toggle like:', error);
            // Revert on error
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
        }
    };

    if (loading) return <div className="loading-state">Loading...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!post) return <div className="error-state">Post not found</div>;

    return (
        <article className="post-detail-container">
            <header className="post-header-wrapper">
                <div className="post-header-content">
                    <span className="post-category-badge">{post.category?.name || 'Uncategorized'}</span>
                    <h1 className="post-main-title">{post.title}</h1>

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
                                    <span className="read-time">5 min read</span> {/* Placeholder or calculate */}
                                </div>
                            </div>
                        </div>
                        <div className="header-actions">
                            {/* Placeholder for share/bookmark actions if needed later */}
                        </div>
                    </div>
                </div>
            </header>

            {post.thumbnailUrl && (
                <div className="post-featured-image">
                    <img src={post.thumbnailUrl} alt={post.title} />
                </div>
            )}

            <div className="post-content-wrapper">
                <div
                    className="post-body-text"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} // SVG allowed via DOMPurify config
                />
            </div>

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
        </article>
    );
};

export default PostDetail;
