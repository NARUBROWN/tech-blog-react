import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllPosts } from '../api/post';
import Typewriter from '../components/Typewriter';
import { AnimatePresence } from 'framer-motion';
import './Home.css';
import PostListSkeleton from '../components/PostListSkeleton';
import PostCard from '../components/PostCard';
import RecapBanner from '../components/Recap/RecapBanner';
import RecapStory from '../components/Recap/RecapStory';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryName = searchParams.get('categoryName');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const heroRef = useRef(null);
    const recapParam = searchParams.get('recap');
    const isRecapOpen = !categoryName && recapParam === 'true';

    useEffect(() => {
        if (!isRecapOpen) return;

        const siteName = 'NARUBROWN의 기술 블로그';
        const defaultTitle = document.title || siteName;
        const recapTitle = '김원정의 2025년 Recap을 확인하세요';
        const description = '올해의 여정을 확인해보세요.';
        const recapUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
        recapUrl.searchParams.set('recap', 'true');
        const ogImage = new URL('/logo.png', window.location.origin).toString();

        const previousMetaContent = new Map();
        const createdMeta = [];

        const upsertMeta = (attr, key, value) => {
            if (!value) return;
            let element = document.querySelector(`meta[${attr}="${key}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, key);
                document.head.appendChild(element);
                createdMeta.push(element);
            } else {
                previousMetaContent.set(element, element.getAttribute('content'));
            }
            element.setAttribute('content', value);
        };

        const metaDefinitions = [
            { attr: 'name', key: 'description', value: description },
            { attr: 'name', key: 'keywords', value: '2025 recap, 김원정, 연말 결산, 백엔드 엔지니어, 기술 블로그' },
            { attr: 'name', key: 'author', value: '김원정 (NARUBROWN)' },
            { attr: 'name', key: 'robots', value: 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1' },
            { attr: 'property', key: 'og:title', value: recapTitle },
            { attr: 'property', key: 'og:description', value: description },
            { attr: 'property', key: 'og:type', value: 'website' },
            { attr: 'property', key: 'og:site_name', value: siteName },
            { attr: 'property', key: 'og:url', value: recapUrl.toString() },
            { attr: 'property', key: 'og:image', value: ogImage },
            { attr: 'property', key: 'og:locale', value: 'ko_KR' },
            { attr: 'name', key: 'twitter:card', value: 'summary_large_image' },
            { attr: 'name', key: 'twitter:title', value: recapTitle },
            { attr: 'name', key: 'twitter:description', value: description },
            { attr: 'name', key: 'twitter:image', value: ogImage }
        ];

        metaDefinitions.forEach(meta => upsertMeta(meta.attr, meta.key, meta.value));

        const existingCanonical = document.querySelector('link[rel="canonical"]');
        const canonicalCreated = !existingCanonical;
        const previousCanonicalHref = existingCanonical?.getAttribute('href') || '';
        const canonicalLink = existingCanonical || document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', recapUrl.toString());
        if (canonicalCreated) {
            document.head.appendChild(canonicalLink);
        }

        document.title = recapTitle;

        return () => {
            document.title = defaultTitle;
            createdMeta.forEach(meta => meta.remove());
            previousMetaContent.forEach((content, meta) => {
                if (content) {
                    meta.setAttribute('content', content);
                } else {
                    meta.removeAttribute('content');
                }
            });

            if (canonicalCreated) {
                canonicalLink.remove();
            } else if (previousCanonicalHref) {
                canonicalLink.setAttribute('href', previousCanonicalHref);
            } else {
                canonicalLink.removeAttribute('href');
            }
        };
    }, [isRecapOpen]);

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
        const controller = new AbortController();
        let isCancelled = false;

        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllPosts(page, 6, categoryName, { signal: controller.signal }); // 6 items per page
                if (isCancelled) return;
                setPosts(data.content || []);
                setTotalPages(data.totalPages || 0);
            } catch (err) {
                if (controller.signal.aborted || err.code === 'ERR_CANCELED') return;
                console.error(err);
                setError('Failed to load posts.');
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchPosts();

        return () => {
            isCancelled = true;
            controller.abort();
        };
    }, [categoryName, page]);

    // Cleanup page when category changes
    useEffect(() => {
        setPage(0);
    }, [categoryName]);

    const openRecap = () => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('recap', 'true');
        setSearchParams(nextParams);
    };

    const closeRecap = () => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('recap');
        setSearchParams(nextParams);
    };

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

            {!categoryName && <RecapBanner onClick={openRecap} />}
            <AnimatePresence>
                {isRecapOpen && <RecapStory onClose={closeRecap} />}
            </AnimatePresence>

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
