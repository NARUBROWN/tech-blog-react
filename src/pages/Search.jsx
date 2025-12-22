import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchPostsRecent } from '../api/post';
import PostCard from '../components/PostCard';
import PostListSkeleton from '../components/PostListSkeleton';
import './Search.css';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('keyword') || '';
    const pageParam = Number.parseInt(searchParams.get('page') || '0', 10);
    const page = Number.isNaN(pageParam) ? 0 : pageParam;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) {
            setPosts([]);
            setTotalPages(0);
            setError(null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        let isCancelled = false;

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await searchPostsRecent(normalizedQuery, page, 12, { signal: controller.signal });
                if (isCancelled) return;
                // Handle both plain array and Spring Page object
                if (Array.isArray(data)) {
                    setPosts(data);
                    setTotalPages(0);
                } else if (data && data.content) {
                    setPosts(data.content);
                    setTotalPages(data.totalPages || 0);
                } else {
                    setPosts([]);
                    setTotalPages(0);
                }
            } catch (err) {
                if (controller.signal.aborted || err.code === 'ERR_CANCELED') return;
                console.error('Search error details:', err);
                setError(`검색 결과를 불러오는 데 실패했습니다: ${err.message}`);
                if (err.response) {
                    console.error('Error response data:', err.response.data);
                    console.error('Error response status:', err.response.status);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchResults();

        return () => {
            isCancelled = true;
            controller.abort();
        };
    }, [query, page]);

    const handlePageChange = (nextPage) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('keyword', query);
        nextParams.set('page', String(nextPage));
        setSearchParams(nextParams);
    };

    return (
        <div className="search-page">
            <div className="search-header-container">
                <div className="search-banner">
                    <h1>{query ? `"${query}" 검색 결과` : '검색 결과'}</h1>
                </div>
            </div>

            <div className="content-container">
                {loading ? (
                    <PostListSkeleton count={6} />
                ) : error ? (
                    <div className="error-container">{error}</div>
                ) : posts.length > 0 ? (
                    <>
                        <div className="post-grid">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <div className="pagination">
                                    {Array.from({ length: totalPages }, (_, i) => i).map((i) => {
                                        if (
                                            i === 0 ||
                                            i === totalPages - 1 ||
                                            (i >= page - 2 && i <= page + 2)
                                        ) {
                                            return (
                                                <button
                                                    key={i}
                                                    className={`pagination-btn ${i === page ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(i)}
                                                >
                                                    {i + 1}
                                                </button>
                                            );
                                        } else if (i === page - 3 || i === page + 3) {
                                            return <span key={i} className="pagination-ellipsis">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                ) : query ? (
                    <div className="no-results">
                        <p>검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    <div className="search-prompt">
                        <p>궁금한 내용을 검색해보세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
