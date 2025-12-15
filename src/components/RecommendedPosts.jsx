import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../api/post';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import './RecommendedPosts.css';

const RecommendedPosts = ({ currentPostId }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch latest posts. In a real app, this might be 'related' posts.
                const data = await getAllPosts(0, 3);
                // Filter out current post if present and limit to 3
                const filtered = data.content
                    .filter(p => p.id !== currentPostId)
                    .slice(0, 3);
                setPosts(filtered);
            } catch (error) {
                console.error("Failed to load recommended posts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [currentPostId]);

    if (loading || posts.length === 0) return null;

    return (
        <div className="recommended-posts-container">
            <h3 className="recommended-title">Recommended Reading</h3>
            <div className="recommended-grid">
                {posts.map(post => (
                    <Link to={`/post/${post.slug}`} key={post.id} className="recommended-card">
                        {post.thumbnailUrl && (
                            <div className="rec-image-wrapper">
                                <img src={post.thumbnailUrl} alt={post.title} />
                            </div>
                        )}
                        <div className="rec-content">
                            <span className="rec-category">{post.category?.name || 'Blog'}</span>
                            <h4 className="rec-post-title">{post.title}</h4>
                            <div className="rec-meta">
                                <span className="rec-date">
                                    {post.publishedAt ? format(new Date(post.publishedAt), 'MMM dd') : ''}
                                </span>
                                <span className="rec-read-more">
                                    Read <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecommendedPosts;
