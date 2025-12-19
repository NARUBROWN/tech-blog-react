import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Tag, Clock, Image, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './PostCard.css';

const PostCard = ({ post }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(!!post.thumbnailUrl);
    const tagsRef = useRef(null);

    const slugify = (text) => {
        return text
            .toString()
            .trim()
            .replace(/\s+/g, '-');
    };

    const getPreview = (htmlContent) => {
        if (!htmlContent) return '';

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        const codeBlocks = tempDiv.querySelectorAll('pre, .ql-code-block');
        codeBlocks.forEach(block => block.remove());

        const isMermaidDefinition = (text) =>
            text && text.match(/^(graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline)/);

        const paras = tempDiv.querySelectorAll('p');
        paras.forEach(p => {
            if (isMermaidDefinition(p.textContent.trim())) {
                p.remove();
            }
        });

        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const clean = textContent.trim();

        return clean.length > 100 ? clean.substring(0, 100) + '...' : clean;
    };

    // Check if tags overflow
    useEffect(() => {
        if (tagsRef.current) {
            // We want to verify if the content *would* exceed the max-height
            // But structurally, we might just check if scrollHeight is significantly larger than clientHeight
            // when collapsed. Or better, always check scrollHeight against a threshold.
            // Let's assume the collapsed 'max-height' corresponds to 2 lines (~ 3rem or so).
            // A safer way is to remove the max-height temporarily to measure, or rely on offsetHeight vs scrollHeight.

            // However, with display: flex and wrap, it's tricky.
            // Let's try comparing scrollHeight to what we expect 2 lines to be.
            // If the element is constrained by CSS, scrollHeight will be the full height.
            // clientHeight will be the constrained height.
            if (tagsRef.current.scrollHeight > tagsRef.current.clientHeight + 1) {
                setShowExpandButton(true);
            }
        }
    }, [post.tags]);

    const handleExpandToggle = (e) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <Link to={`/post/${slugify(post.title)}`} className="post-card">
            {post.thumbnailUrl ? (
                <div className="post-card-thumbnail">
                    {isImageLoading && <Loader2 className="spinner" size={24} />}
                    <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        onLoad={() => setIsImageLoading(false)}
                        onError={() => setIsImageLoading(false)}
                        style={{ opacity: isImageLoading ? 0 : 1, transition: 'opacity 0.3s' }}
                    />
                    {post.category && (
                        <span className="category-badge-overlay">{post.category.name}</span>
                    )}
                </div>
            ) : (
                <div className="post-card-thumbnail placeholder">
                    <Image size={48} color="#9ca3af" />
                    {post.category && (
                        <span className="category-badge-overlay">{post.category.name}</span>
                    )}
                </div>
            )}

            <div className="post-card-content">
                <h3 className="post-card-title">{post.title}</h3>

                <p className="post-card-preview">
                    {getPreview(post.content)}
                </p>

                <div className="post-card-footer">
                    <div className="post-card-author">
                        <div className="author-avatar-sm">
                            {post.author?.profileImageUrl ? (
                                <img src={post.author.profileImageUrl} alt={post.author.username} />
                            ) : (
                                <User size={16} />
                            )}
                        </div>
                        <span className="author-name-sm">{post.author?.username}</span>
                    </div>

                    <div className="post-card-meta">
                        <Clock size={14} />
                        <span>
                            {post.publishedAt
                                ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
                                : 'Draft'}
                        </span>
                    </div>
                </div>

                <div className="post-card-tags-wrapper">
                    <div
                        className={`post-card-tags ${isExpanded ? 'expanded' : 'collapsed'}`}
                        ref={tagsRef}
                    >
                        {post.tags?.tagNames?.map((tag) => (
                            <span key={tag} className="tag-badge">
                                <Tag size={12} /> {tag}
                            </span>
                        ))}
                    </div>
                    {showExpandButton && (
                        <button
                            className="tags-expand-btn"
                            onClick={handleExpandToggle}
                            aria-label={isExpanded ? "Collapse tags" : "Expand tags"}
                        >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default PostCard;
