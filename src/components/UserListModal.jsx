import { X, User } from 'lucide-react';
import './UserListModal.css';

const UserListModal = ({ isOpen, onClose, title, users }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-content">
                    {users.length === 0 ? (
                        <p className="no-users-message">No likes yet.</p>
                    ) : (
                        <ul className="user-list">
                            {users.map((user) => (
                                <li key={user.id || user.username} className="user-list-item">
                                    <div className="user-avatar">
                                        {user.profileImageUrl ? (
                                            <img src={user.profileImageUrl} alt={user.username} />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <span className="user-name">{user.username}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;
