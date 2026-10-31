import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import './ManagementForm.css';

const ProfileSettings = () => {
    const { user, updateUserInfo, loading } = useAuth();
    const [draft, setDraft] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const formData = {
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || '',
        profileImageUrl: user?.profileImageUrl || '',
        originalPassword: '',
        ...draft,
    };
    const handleChange = event => setDraft(previous => ({ ...previous, [event.target.name]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage({ type: '', text: '' });
        if (!formData.originalPassword) {
            setMessage({ type: 'error', text: '변경사항을 저장하려면 현재 비밀번호를 입력해 주세요.' });
            return;
        }
        const result = await updateUserInfo(formData);
        if (result.success) {
            setMessage({ type: 'success', text: '프로필을 저장했습니다.' });
            setDraft({});
        } else {
            setMessage({ type: 'error', text: '프로필을 저장하지 못했습니다. 현재 비밀번호를 확인하고 다시 시도해 주세요.' });
        }
    };

    return (
        <div className="management-page">
            <div className="management-shell">
                <Link to="/" className="management-back"><ArrowLeft size={15} aria-hidden="true" /> 홈으로</Link>
                <header className="management-header">
                    <h1>프로필 설정</h1>
                    <p>프로필 정보와 계정 정보를 관리합니다.</p>
                </header>
                {message.text && <div className={`management-notice ${message.type === 'success' ? 'management-notice-success' : ''}`} role={message.type === 'success' ? 'status' : 'alert'}>{message.text}</div>}
                <form onSubmit={handleSubmit} className="management-form" aria-busy={loading}>
                    <div className="profile-settings-grid">
                        <div className="management-fields">
                            <div className="management-field">
                                <label htmlFor="username">사용자 이름</label>
                                <input type="text" name="username" id="username" autoComplete="username" value={formData.username} onChange={handleChange} required />
                            </div>
                            <div className="management-field">
                                <label htmlFor="email">이메일</label>
                                <input type="email" name="email" id="email" autoComplete="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="management-field">
                                <label htmlFor="bio">소개</label>
                                <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} rows="4" placeholder="나를 소개하는 글을 작성해 주세요" />
                            </div>
                            <div className="management-field profile-confirmation">
                                <label htmlFor="originalPassword">현재 비밀번호</label>
                                <p className="management-hint" id="password-hint">변경사항을 저장하려면 비밀번호를 확인해 주세요.</p>
                                <input type="password" name="originalPassword" id="originalPassword" autoComplete="current-password" aria-describedby="password-hint" value={formData.originalPassword} onChange={handleChange} required placeholder="현재 비밀번호를 입력하세요" />
                            </div>
                        </div>
                        <aside className="profile-image-panel" aria-labelledby="profile-image-heading">
                            <h2 id="profile-image-heading">프로필 사진</h2>
                            <p className="management-hint">작성자 정보에 표시되는 사진입니다.</p>
                            <ImageUpload label="프로필 사진" className="profile-image-upload" onUpload={url => setDraft(previous => ({ ...previous, profileImageUrl: url }))} initialUrl={formData.profileImageUrl} />
                        </aside>
                    </div>
                    <div className="management-actions">
                        <button type="submit" className="management-submit" disabled={loading}><Save size={16} aria-hidden="true" />{loading ? '저장 중...' : '변경사항 저장'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default ProfileSettings;
