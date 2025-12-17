import React from 'react';
import Skeleton from './Skeleton';
import '../pages/PostDetail.css';

const PostDetailSkeleton = () => {
    return (
        <div className="post-detail-container">
            {/* Banner Image */}
            <div className="post-featured-image-banner" style={{ backgroundColor: '#f1f5f9' }}>
                <Skeleton variant="rectangular" width="100%" height="100%" />
            </div>

            <div className="post-header-wrapper">
                <div className="post-header-content">
                    {/* Category Badge */}
                    <Skeleton variant="text" width={100} height="1.5rem" style={{ borderRadius: '999px', marginBottom: '1rem' }} />

                    {/* Title */}
                    <Skeleton variant="text" height="3rem" width="90%" style={{ marginBottom: '1.5rem' }} />

                    {/* Meta Row */}
                    <div className="post-meta-row">
                        <div className="author-layout">
                            {/* Author Avatar */}
                            <Skeleton variant="circular" width={44} height={44} />

                            {/* Author Details */}
                            <div className="author-details" style={{ gap: '4px' }}>
                                <Skeleton variant="text" width={120} height="1rem" />
                                <div className="meta-sub">
                                    <Skeleton variant="text" width={150} height="0.8rem" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="post-content-wrapper">
                <Skeleton variant="text" width="100%" height="1em" style={{ marginBottom: '1rem' }} />
                <Skeleton variant="text" width="95%" height="1em" style={{ marginBottom: '1rem' }} />
                <Skeleton variant="text" width="90%" height="1em" style={{ marginBottom: '1rem' }} />
                <Skeleton variant="text" width="98%" height="1em" style={{ marginBottom: '1rem' }} />
                <br />
                <Skeleton variant="rectangular" width="100%" height="200px" style={{ marginBottom: '2rem' }} />
                <br />
                <Skeleton variant="text" width="100%" height="1em" style={{ marginBottom: '1rem' }} />
                <Skeleton variant="text" width="92%" height="1em" style={{ marginBottom: '1rem' }} />
                <Skeleton variant="text" width="85%" height="1em" style={{ marginBottom: '1rem' }} />
            </div>
        </div>
    );
};

export default PostDetailSkeleton;
