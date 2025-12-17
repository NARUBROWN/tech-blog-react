import React from 'react';
import Skeleton from './Skeleton';
import '../pages/Home.css'; // Use Home CSS grid styles

const PostSkeleton = () => {
    return (
        <div className="post-card">
            {/* Thumbnail */}
            <div className="post-card-thumbnail" style={{ position: 'relative' }}>
                <Skeleton variant="rectangular" width="100%" height="100%" />
            </div>

            <div className="post-card-content">
                {/* Title */}
                <Skeleton variant="text" height="1.5rem" width="80%" style={{ marginBottom: '1rem' }} />

                {/* Preview Text */}
                <div style={{ marginBottom: 'auto' }}>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="60%" />
                </div>

                {/* Footer */}
                <div className="post-card-footer">
                    <div className="post-card-author">
                        <Skeleton variant="circular" width={28} height={28} />
                        <Skeleton variant="text" width={80} />
                    </div>
                    <div className="post-card-meta">
                        <Skeleton variant="text" width={60} />
                    </div>
                </div>

                {/* Tags */}
                <div className="post-card-tags">
                    <Skeleton variant="text" width={50} height="1.5em" style={{ borderRadius: '999px' }} />
                    <Skeleton variant="text" width={60} height="1.5em" style={{ borderRadius: '999px' }} />
                </div>
            </div>
        </div>
    );
};

const PostListSkeleton = ({ count = 6 }) => {
    return (
        <div className="post-grid">
            {Array.from({ length: count }).map((_, index) => (
                <PostSkeleton key={index} />
            ))}
        </div>
    );
};

export default PostListSkeleton;
