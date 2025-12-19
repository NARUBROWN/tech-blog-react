import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllPosts } from '../api/post';
import Typewriter from '../components/Typewriter';
import './Home.css';
import PostListSkeleton from '../components/PostListSkeleton';
import PostCard from '../components/PostCard';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryName = searchParams.get('categoryName');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const heroRef = useRef(null);

    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;

        const setPointerVars = (xPercent, yPercent) => {
            hero.style.setProperty('--pointer-x', `${xPercent}%`);
            hero.style.setProperty('--pointer-y', `${yPercent}%`);
        };

        const updatePointer = (event) => {
            const rect = hero.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            const clampedX = Math.max(0, Math.min(100, x));
            const clampedY = Math.max(0, Math.min(100, y));
            setPointerVars(clampedX, clampedY);
        };

        const resetPointer = () => setPointerVars(50, 45);

        hero.addEventListener('pointermove', updatePointer, { passive: true });
        hero.addEventListener('pointerleave', resetPointer);
        resetPointer();

        return () => {
            hero.removeEventListener('pointermove', updatePointer);
            hero.removeEventListener('pointerleave', resetPointer);
        };
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const data = await getAllPosts(page, 6, categoryName); // 6 items per page
                // data.content contains the array of posts
                setPosts(data.content || []);
                setTotalPages(data.totalPages || 0);
            } catch (err) {
                console.error(err);
                setError('Failed to load posts.');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [categoryName, page]);

    // Cleanup page when category changes
    useEffect(() => {
        setPage(0);
    }, [categoryName]);

    // Use a text-only version of content for preview if needed, or just show title/tags
    // For safety, we can strip HTML from content or just not show it in the preview card

    return (
        <div className="home-page">
            {!categoryName ? (
                <div className="hero-immersive" ref={heroRef}>
                    <div className="hero-section">
                        <div className="hero-grid-overlay" aria-hidden="true"></div>
                        <div className="hero-content">
                            <h1>
                                <Typewriter
                                    phrases={[
                                        "동시성을 구조로 다루는",
                                        "성능을 수치로 증명하는",
                                        "관심사를 코드로 분리하는",
                                        "레거시를 현실적으로 개선하는",
                                        "운영까지 책임지는",
                                        "아키텍처를 문서로 남기는",
                                        "팀의 시행착오를 줄이는",
                                        "복잡함을 단순한 구조로 바꾸는"
                                    ]}
                                /> <br></br>개발자
                            </h1>
                            <p>실무에서 마주한 문제를 구조로 풀고, 그 선택을 수치와 기록으로 남깁니다.</p>
                            <div className="hero-actions">
                                <Link to="/about" className="btn btn-primary btn-lg">자기소개서 확인하기</Link>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="category-header">
                    <h1>{categoryName}</h1>
                </div>
            )}

            <div className="content-container">
                {loading ? (
                    <PostListSkeleton count={6} />
                ) : error ? (
                    <div className="error-container">{error}</div>
                ) : (
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
                                        // Logic for [1][2][3]...[6]
                                        // Show first, last, current, current+/-1, current+/-2
                                        if (
                                            i === 0 ||
                                            i === totalPages - 1 ||
                                            (i >= page - 2 && i <= page + 2)
                                        ) {
                                            return (
                                                <button
                                                    key={i}
                                                    className={`pagination-btn ${i === page ? 'active' : ''}`}
                                                    onClick={() => setPage(i)}
                                                >
                                                    {i + 1}
                                                </button>
                                            );
                                        } else if (
                                            i === page - 3 ||
                                            i === page + 3
                                        ) {
                                            return <span key={i} className="pagination-ellipsis">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )
                }
            </div >
        </div >
    );
};

export default Home;
