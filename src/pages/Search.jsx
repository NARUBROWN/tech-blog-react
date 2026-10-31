import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, RotateCcw } from 'lucide-react';
import { searchPostsRecent } from '../api/post';
import PostCard from '../components/PostCard';
import PostListSkeleton from '../components/PostListSkeleton';
import './Search.css';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = (searchParams.get('keyword') || '').trim();
    const pageParam = Number.parseInt(searchParams.get('page') || '0', 10);
    const page = Number.isNaN(pageParam) ? 0 : Math.max(0, pageParam);
    const [retryCount, setRetryCount] = useState(0);
    const [result, setResult] = useState({ key: '', posts: [], totalPages: 0, error: false });
    const requestKey = JSON.stringify([query, page, retryCount]);

    useEffect(() => {
        if (!query) return undefined;

        const controller = new AbortController();
        const fetchResults = async () => {
            try {
                const data = await searchPostsRecent(query, page, 12, { signal: controller.signal });
                if (controller.signal.aborted) return;
                setResult({
                    key: requestKey,
                    posts: Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []),
                    totalPages: Array.isArray(data) ? 0 : (data?.totalPages || 0),
                    error: false,
                });
            } catch (err) {
                if (controller.signal.aborted || err.code === 'ERR_CANCELED') return;
                console.error('Failed to search posts:', err);
                setResult({ key: requestKey, posts: [], totalPages: 0, error: true });
            }
        };

        fetchResults();
        return () => controller.abort();
    }, [query, page, requestKey]);

    const loading = Boolean(query) && result.key !== requestKey;
    const handleSearch = (event) => {
        event.preventDefault();
        const keyword = String(new FormData(event.currentTarget).get('keyword') || '').trim();
        setSearchParams(keyword ? { keyword, page: '0' } : {});
    };

    const handlePageChange = (nextPage) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('keyword', query);
        nextParams.set('page', String(nextPage));
        setSearchParams(nextParams);
    };

    return (
        <div className="search-page" data-performance-page="/search" data-performance-ready={!loading && (!query || !result.error)}>
            <header className="search-header">
                <Link to="/" className="search-back"><ArrowLeft size={16} aria-hidden="true" /> 홈으로</Link>
                <h1>글 검색</h1>
                <p>궁금한 주제나 키워드로 기록을 찾아보세요.</p>
                <form key={query} className="search-form" onSubmit={handleSearch} role="search">
                    <label htmlFor="search-keyword">검색어</label>
                    <div className="search-input-row">
                        <SearchIcon size={20} aria-hidden="true" />
                        <input id="search-keyword" name="keyword" type="search" defaultValue={query}
                            placeholder="검색어를 입력해 주세요" autoComplete="off" />
                        <button type="submit">검색</button>
                    </div>
                </form>
            </header>

            <section className="search-results" aria-labelledby="search-results-title" aria-busy={loading}>
                <div className="search-results-heading">
                    <h2 id="search-results-title">{query ? '검색 결과' : '기록 찾아보기'}</h2>
                    {query && <p><strong>“{query}”</strong> 검색 결과</p>}
                </div>
                {loading ? (
                    <PostListSkeleton count={6} />
                ) : !query ? (
                    <div className="search-state">
                        <SearchIcon size={24} aria-hidden="true" />
                        <h3>어떤 내용이 궁금하신가요?</h3>
                        <p>검색어를 입력하면 관련된 글을 찾아볼 수 있어요.</p>
                    </div>
                ) : result.error ? (
                    <div className="search-state" role="status">
                        <h3>검색 결과를 불러오지 못했어요.</h3>
                        <p>잠시 후 다시 시도해 주세요.</p>
                        <button className="search-retry" onClick={() => setRetryCount(count => count + 1)}>
                            <RotateCcw size={15} aria-hidden="true" /> 다시 불러오기
                        </button>
                    </div>
                ) : result.posts.length === 0 ? (
                    <div className="search-state" role="status">
                        <SearchIcon size={24} aria-hidden="true" />
                        <h3>검색 결과가 없어요.</h3>
                        <p>다른 검색어나 더 짧은 키워드로 찾아보세요.</p>
                    </div>
                ) : (
                    <>
                        <div className="post-grid">
                            {result.posts.map(post => <PostCard key={post.id} post={post} />)}
                        </div>
                        {result.totalPages > 1 && (
                            <nav className="pagination-container" aria-label="검색 결과 페이지">
                                <div className="pagination">
                                    {Array.from({ length: result.totalPages }, (_, i) => {
                                        if (i === 0 || i === result.totalPages - 1 || (i >= page - 2 && i <= page + 2)) {
                                            return (
                                                <button key={i} className={`pagination-btn ${i === page ? 'active' : ''}`}
                                                    aria-label={`${i + 1}페이지`} aria-current={i === page ? 'page' : undefined}
                                                    onClick={() => handlePageChange(i)}>{i + 1}</button>
                                            );
                                        }
                                        if (i === page - 3 || i === page + 3) {
                                            return <span key={i} className="pagination-ellipsis">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                            </nav>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default Search;
