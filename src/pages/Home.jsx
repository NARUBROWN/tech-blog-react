import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllPosts } from '../api/post';
import { User, Tag, Clock, Image } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import './Home.css';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryName = searchParams.get('categoryName');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const heroRef = useRef(null);

    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;

        const setPointerVars = (xPercent, yPercent) => {
            hero.style.setProperty('--pointer-x', `${xPercent}%`);
            hero.style.setProperty('--pointer-y', `${yPercent}%`);
        };

        const updatePointer = (event) => {
            const rect = hero.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            const clampedX = Math.max(0, Math.min(100, x));
            const clampedY = Math.max(0, Math.min(100, y));
            setPointerVars(clampedX, clampedY);
        };

        const resetPointer = () => setPointerVars(50, 45);

        hero.addEventListener('pointermove', updatePointer, { passive: true });
        hero.addEventListener('pointerleave', resetPointer);
        resetPointer();

        return () => {
            hero.removeEventListener('pointermove', updatePointer);
            hero.removeEventListener('pointerleave', resetPointer);
        };
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const data = await getAllPosts(page, 6, categoryName); // 6 items per page
                // data.content contains the array of posts
                setPosts(data.content || []);
                setTotalPages(data.totalPages || 0);
            } catch (err) {
                console.error(err);
                setError('Failed to load posts.');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [categoryName, page]);

    // Cleanup page when category changes
    useEffect(() => {
        setPage(0);
    }, [categoryName]);

    // Use a text-only version of content for preview if needed, or just show title/tags
    // For safety, we can strip HTML from content or just not show it in the preview card
    const getPreview = (htmlContent) => {
        if (!htmlContent) return '';

        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Remove code blocks (pre tags and Quill code blocks)
        const codeBlocks = tempDiv.querySelectorAll('pre, .ql-code-block');
        codeBlocks.forEach(block => block.remove());

        // Helper to check for Mermaid definitions
        const isMermaidDefinition = (text) =>
            text && text.match(/^(graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline)/);

        // Remove paragraphs that look like Mermaid diagrams
        const paras = tempDiv.querySelectorAll('p');
        paras.forEach(p => {
            if (isMermaidDefinition(p.textContent.trim())) {
                p.remove();
            }
        });

        // Now extract text from what's left
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const clean = textContent.trim();

        return clean.length > 100 ? clean.substring(0, 100) + '...' : clean;
    };

    const slugify = (text) => {
        return text
            .toString()
            .trim()
            .replace(/\s+/g, '-'); // Replace spaces with -
    };

    return (
        <div className="home-page">
            <div className="hero-immersive" ref={heroRef}>
                <div className="hero-section">
                    <div className="hero-grid-overlay" aria-hidden="true"></div>
                    <div className="hero-content">
                        <h1>Backend Engineer&apos;s Launchpad</h1>
                        <p>Share systems thinking, architecture wins, and pragmatic backend lessons with the community.</p>
                        <div className="hero-actions">
                            <Link to="/post/create" className="btn btn-primary btn-lg">Start Writing</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-container">
                {loading ? (
                    <div className="loading-container">Loading...</div>
                ) : error ? (
                    <div className="error-container">{error}</div>
                ) : (
                    <>
                        <div className="post-grid">
                            {posts.map((post) => (
                                <Link to={`/post/${slugify(post.title)}`} key={post.id} className="post-card">
                                    {post.thumbnailUrl ? (
                                        <div className="post-card-thumbnail">
                                            <img src={post.thumbnailUrl} alt={post.title} />
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

                                        <div className="post-card-tags">
                                            {post.tags?.tagNames?.map((tag) => (
                                                <span key={tag} className="tag-badge">
                                                    <Tag size={12} /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <div className="pagination">
                                    {Array.from({ length: totalPages }, (_, i) => i).map((i) => {
                                        // Logic for [1][2][3]...[6]
                                        // Show first, last, current, current+/-1, current+/-2
                                        if (
                                            i === 0 ||
                                            i === totalPages - 1 ||
                                            (i >= page - 2 && i <= page + 2)
                                        ) {
                                            return (
                                                <button
                                                    key={i}
                                                    className={`pagination-btn ${i === page ? 'active' : ''}`}
                                                    onClick={() => setPage(i)}
                                                >
                                                    {i + 1}
                                                </button>
                                            );
                                        } else if (
                                            i === page - 3 ||
                                            i === page + 3
                                        ) {
                                            return <span key={i} className="pagination-ellipsis">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;
