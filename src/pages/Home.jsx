import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../api/post';
import { User, Tag, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import './Home.css';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getAllPosts();
                // data.content contains the array of posts based on the provided JSON
                setPosts(data.content || []);
            } catch (err) {
                console.error(err);
                setError('Failed to load posts.');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Use a text-only version of content for preview if needed, or just show title/tags
    // For safety, we can strip HTML from content or just not show it in the preview card
    const getPreview = (htmlContent) => {
        const clean = DOMPurify.sanitize(htmlContent, { ALLOWED_TAGS: [] });
        return clean.length > 100 ? clean.substring(0, 100) + '...' : clean;
    };

    const slugify = (text) => {
        return text
            .toString()
            .trim()
            .replace(/\s+/g, '-'); // Replace spaces with -
    };

    return (
        <div className="container home-page">
            <div className="hero-section">
                <h1>Welcome to TechBlog</h1>
                <p>A premium space for developers to share knowledge.</p>
                <div className="hero-actions">
                    <Link to="/post/create" className="btn btn-primary btn-lg">Start Writing</Link>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">Loading...</div>
            ) : error ? (
                <div className="error-container">{error}</div>
            ) : (
                <div className="post-grid">
                    {posts.map((post) => (
                        <Link to={`/post/${slugify(post.title)}`} key={post.id} className="post-card">
                            {post.thumbnailUrl && (
                                <div className="post-card-thumbnail">
                                    <img src={post.thumbnailUrl} alt={post.title} />
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
            )}
        </div>
    );
};

export default Home;
