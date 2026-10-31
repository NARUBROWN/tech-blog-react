import { useEffect, useState } from 'react';
import { getComments, createComment, updateComment, deleteComment } from '../api/comments';
import './Comments.css';

const message = error => error.response?.data?.message || '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
const date = value => new Date(value).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });

export default function Comments({ postId, isAdmin = false }) {
    const [page, setPage] = useState(0);
    const [revision, setRevision] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState({ nickname: '익명', password: '', content: '' });

    useEffect(() => {
        const controller = new AbortController();
        getComments(postId, page, { signal: controller.signal }).then(data => {
            if (data.totalPages > 0 && page >= data.totalPages) { setPage(data.totalPages - 1); return; }
            setResult(data); setError('');
        }).catch(err => { if (!controller.signal.aborted) setError(message(err)); });
        return () => controller.abort();
    }, [postId, page, revision]);

    const submit = async event => {
        event.preventDefault();
        if (busy) return;
        setBusy(true); setError('');
        try {
            await createComment(postId, draft);
            setDraft(previous => ({ ...previous, password: '', content: '' }));
            setPage(Math.max(0, Math.ceil(((result?.totalElements || 0) + 1) / 20) - 1));
            setRevision(value => value + 1);
        } catch (err) { setError(message(err)); }
        finally { setBusy(false); }
    };

    const manage = async event => {
        event.preventDefault();
        if (!editing || busy) return;
        setBusy(true); setError('');
        try {
            if (editing.mode === 'delete') await deleteComment(editing.id, editing.password);
            else await updateComment(editing.id, { content: editing.content, password: editing.password });
            setEditing(null); setRevision(value => value + 1);
        } catch (err) { setError(message(err)); }
        finally { setBusy(false); }
    };

    return (
        <section className="comments-section" aria-labelledby="comments-heading">
            <div className="comments-heading">
                <h2 id="comments-heading">댓글 <span>{result?.totalElements || 0}</span></h2>
                <p>로그인 없이 의견을 남겨보세요.</p>
            </div>
            {error && <div className="comments-error" role="alert">{error}</div>}
            {!result && !error && <p role="status" className="comments-muted">댓글을 불러오고 있어요.</p>}
            {result?.content.length === 0 && <p className="comments-empty">첫 댓글을 남겨주세요.</p>}
            <ul className="comments-list">
                {result?.content.map(comment => (
                    <li key={comment.id} className="comment-item">
                        <header className="comment-meta">
                            <strong>{comment.nickname}</strong>
                            <time dateTime={comment.createdAt}>{date(comment.createdAt)}</time>
                            <div className="comment-actions">
                                <button type="button" disabled={busy} onClick={() => setEditing({ ...comment, mode: 'edit', password: '' })} aria-label={`${comment.nickname}님의 댓글 수정`}>수정</button>
                                <button type="button" disabled={busy} onClick={() => setEditing({ ...comment, mode: 'delete', password: '' })} aria-label={`${comment.nickname}님의 댓글 삭제`}>삭제</button>
                            </div>
                        </header>
                        <p className="comment-content">{comment.content}</p>
                        {editing?.id === comment.id && (
                            <form onSubmit={manage} className="comment-manage-form">
                                {editing.mode === 'edit' ? <>
                                    <label htmlFor={`edit-comment-${comment.id}`}>댓글 수정</label>
                                    <textarea id={`edit-comment-${comment.id}`} required maxLength={2000} value={editing.content} onChange={event => setEditing({ ...editing, content: event.target.value })} />
                                </> : <p>이 댓글을 삭제하시겠어요?</p>}
                                {!(editing.mode === 'delete' && isAdmin) && <>
                                    <label htmlFor={`comment-password-${comment.id}`}>작성 시 입력한 비밀번호</label>
                                    <input id={`comment-password-${comment.id}`} type="password" autoComplete="off" required minLength={4} maxLength={72} value={editing.password} onChange={event => setEditing({ ...editing, password: event.target.value })} />
                                </>}
                                <div className="comment-form-actions">
                                    <button type="button" disabled={busy} onClick={() => setEditing(null)}>취소</button>
                                    <button type="submit" disabled={busy}>{busy ? '처리 중…' : editing.mode === 'edit' ? '수정하기' : '삭제하기'}</button>
                                </div>
                            </form>
                        )}
                    </li>
                ))}
            </ul>
            {result?.totalPages > 1 && <nav className="comment-pagination" aria-label="댓글 페이지">
                <button type="button" disabled={page === 0 || busy} onClick={() => setPage(value => value - 1)}>이전</button>
                <span>{page + 1} / {result.totalPages}</span>
                <button type="button" disabled={page >= result.totalPages - 1 || busy} onClick={() => setPage(value => value + 1)}>다음</button>
            </nav>}
            <form onSubmit={submit} className="comment-create-form">
                <div className="comment-identity-fields">
                    <label>닉네임<input name="nickname" required maxLength={24} autoComplete="nickname" value={draft.nickname} onChange={event => setDraft({ ...draft, nickname: event.target.value })} /></label>
                    <label>비밀번호<input name="password" type="password" required minLength={4} maxLength={72} autoComplete="new-password" placeholder="4자 이상" value={draft.password} onChange={event => setDraft({ ...draft, password: event.target.value })} /></label>
                </div>
                <label htmlFor="new-comment-content">댓글</label>
                <textarea id="new-comment-content" name="content" required maxLength={2000} rows={4} placeholder="서로를 존중하는 댓글을 남겨주세요." value={draft.content} onChange={event => setDraft({ ...draft, content: event.target.value })} />
                <div className="comment-submit-row">
                    <p>수정하거나 삭제할 때 비밀번호가 필요합니다.</p>
                    <button type="submit" disabled={busy}>{busy ? '등록 중…' : '댓글 등록'}</button>
                </div>
            </form>
        </section>
    );
}
