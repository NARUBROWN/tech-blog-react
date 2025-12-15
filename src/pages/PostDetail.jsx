import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPostBySlug } from '../api/post';
import { Calendar, User, Tag, Heart, Eye } from 'lucide-react';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import './PostDetail.css';

const PostDetail = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await getPostBySlug(slug);
                setPost(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load post.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPost();
    }, [slug]);

    if (loading) return <div className="loading-state">Loading...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!post) return <div className="error-state">Post not found</div>;

    return (
        <article className="container post-detail">
            <header className="post-header">
                <div className="post-meta">
                    <span className="post-category">{post.category?.name || 'Uncategorized'}</span>
                    <span className="meta-separator">•</span>
                    <span className="post-date">
                        {post.publishedAt ? format(new Date(post.publishedAt), 'MMM dd, yyyy') : 'Draft'}
                    </span>
                </div>

                <h1 className="post-title">{post.title}</h1>

                <div className="author-info">
                    <div className="author-avatar">
                        {post.author?.profileImageUrl ? (
                            <img src={post.author.profileImageUrl} alt={post.author.username} />
                        ) : (
                            <User size={24} />
                        )}
                    </div>
                    <div className="author-text">
                        <span className="author-name">{post.author?.username}</span>
                        <span className="author-bio">{post.author?.bio}</span>
                    </div>
                </div>
            </header>

            {post.thumbnailUrl && (
                <div className="post-thumbnail">
                    <img src={post.thumbnailUrl} alt={post.title} />
                </div>
            )}

            <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />

            <footer className="post-footer">
                <div className="post-tags">
                    {post.tags?.tagNames?.map((tag, index) => (
                        <span key={index} className="tag">
                            <Tag size={14} /> {tag}
                        </span>
                    ))}
                </div>

                <div className="post-stats">
                    <div className="stat-item">
                        <Heart size={20} />
                        <span>{post.likeCount}</span>
                    </div>
                    <div className="stat-item">
                        <Eye size={20} />
                        <span>{post.viewCount}</span>
                    </div>
                </div>
            </footer>
        </article>
    );
};

export default PostDetail;
