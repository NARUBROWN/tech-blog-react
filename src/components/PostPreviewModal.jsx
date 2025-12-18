import React from 'react';
import { X, Send, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import PostContent from './PostContent';
import './PostPreviewModal.css';

const PostPreviewModal = ({ isOpen, onClose, onPublish, data, isPublishing, author }) => {
    if (!isOpen) return null;

    const { title, content, thumbnailUrl, categoryName, tags } = data;
    const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    return (
        <div className="preview-modal-overlay">
            <div className="preview-modal-container">
                <header className="preview-modal-header">
                    <div className="preview-title-area">
                        <span className="preview-badge">Preview</span>
                        <span className="preview-label">Check how your post looks</span>
                    </div>
                    <button onClick={onClose} className="preview-close-btn" title="Close Preview">
                        <X size={24} />
                    </button>
                </header>

                <div className="preview-modal-body">
                    <article className="post-detail-container">
                        {/* Thumbnail */}
                        {thumbnailUrl && (
                            <div className="post-featured-image-banner">
                                <img src={thumbnailUrl} alt={title} />
                            </div>
                        )}

                        <header className="post-header-wrapper">
                            <div className="post-header-content">
                                {/* Category */}
                                <span className="post-category-badge">{categoryName || 'Uncategorized'}</span>

                                {/* Title */}
                                <h1 className="post-main-title">{title || 'Untitled Post'}</h1>

                                {/* Author Info */}
                                <div className="post-meta-row">
                                    <div className="author-layout">
                                        {author?.profileImageUrl ? (
                                            <img src={author.profileImageUrl} alt={author.username} className="author-img" />
                                        ) : (
                                            <div className="author-placeholder"><User size={20} /></div>
                                        )}
                                        <div className="author-details">
                                            <span className="author-username">{author?.username || 'You'}</span>
                                            <div className="meta-sub">
                                                <span className="post-date">
                                                    {format(new Date(), 'MMM dd, yyyy')}
                                                </span>
                                                <span className="dot-divider">·</span>
                                                <span className="read-time">Just now</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Content */}
                        <PostContent content={content} />

                        {/* Footer (Tags) */}
                        <footer className="post-footer-wrapper">
                            <div className="post-tags-list">
                                {tagList.map((tag, index) => (
                                    <span key={index} className="post-tag-chip">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </footer>
                    </article>
                </div>

                <footer className="preview-modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={isPublishing}>
                        Back to Edit
                    </button>
                    <button
                        className="btn-confirm-publish"
                        onClick={onPublish}
                        disabled={isPublishing}
                    >
                        {isPublishing ? (
                            <span>Publishing...</span>
                        ) : (
                            <>
                                <Send size={18} />
                                <span>Publish Now</span>
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default PostPreviewModal;
