import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { createCategory } from '../api/category';
import './ManagementForm.css';

const CreateCategory = () => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        const categoryName = name.trim();
        if (!categoryName) {
            setError('카테고리 이름을 입력해 주세요.');
            return;
        }
        setLoading(true);
        try {
            await createCategory(categoryName);
            setSuccess(`“${categoryName}” 카테고리를 추가했습니다.`);
            setName('');
        } catch {
            setError('카테고리를 추가하지 못했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="management-page">
            <div className="management-shell">
                <Link to="/" className="management-back"><ArrowLeft size={15} aria-hidden="true" /> 홈으로</Link>
                <header className="management-header">
                    <h1>카테고리 추가</h1>
                    <p>글을 주제별로 분류할 카테고리를 추가합니다.</p>
                </header>
                {error && <div className="management-notice" role="alert">{error}</div>}
                {success && <div className="management-notice management-notice-success" role="status">{success}</div>}
                <form onSubmit={handleSubmit} className="management-form management-form-category" aria-busy={loading}>
                    <div className="management-field">
                        <label htmlFor="category-name">카테고리 이름</label>
                        <input id="category-name" type="text" value={name} onChange={event => setName(event.target.value)} placeholder="예: 기술, 커리어, 에세이" required />
                    </div>
                    <div className="management-actions">
                        <button type="submit" className="management-submit" disabled={loading}><Plus size={16} aria-hidden="true" />{loading ? '추가 중...' : '카테고리 추가'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CreateCategory;
