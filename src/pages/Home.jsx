import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllPosts } from '../api/post';
import { ArrowUpRight, ArrowDown, RotateCcw, Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import './Home.css';
import PostListSkeleton from '../components/PostListSkeleton';
import PostCard from '../components/PostCard';
import RecapStory from '../components/Recap/RecapStory';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryName = searchParams.get('categoryName');
    const [pageSelection, setPageSelection] = useState({ category: null, index: 0 });
    const page = pageSelection.category === categoryName ? pageSelection.index : 0;
    const setPage = (index) => setPageSelection({ category: categoryName, index });
    const [retryCount, setRetryCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
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
                setError('잠시 후 다시 시도해 주세요.');
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
    }, [categoryName, page, retryCount]);

    const closeRecap = () => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('recap');
        setSearchParams(nextParams);
    };

    return (
        <div className="home-page">
            {!categoryName ? (
                <header className="home-intro">
                    <div className="home-intro-copy">
                        <p className="home-byline">기술 블로그</p>
                        <h1>문제를 풀고,<br />경험을 기록합니다.</h1>
                        <p className="home-description">세상의 문제를 인공지능으로 해결하는 엔지니어입니다.<br className="home-desktop-break" /> 직접 만들고 개선하며 얻은 경험을 나눕니다.</p>
                        <div className="home-actions">
                            <Link to="/about" className="home-button">자기소개서 보기 <ArrowUpRight size={17} aria-hidden="true" /></Link>
                            <a href="#posts" className="home-text-link">글 읽기 <ArrowDown size={16} aria-hidden="true" /></a>
                        </div>
                    </div>
                    <aside className="home-project-links" aria-label="프로젝트 바로가기">
                        <Link to="/about#professional-projects">
                            <span className="home-project-label">실무 프로젝트 <ArrowUpRight size={17} aria-hidden="true" /></span>
                            <span className="home-project-description">다양한 프로젝트를 확인하세요</span>
                        </Link>
                        <Link to="/about#personal-projects">
                            <span className="home-project-label">Spine <ArrowUpRight size={17} aria-hidden="true" /></span>
                            <span className="home-project-description">현재 유지보수하고 있는 Go 백엔드 프레임워크</span>
                        </Link>
                        <Link to="/about#activities">
                            <span className="home-project-label">활동 <ArrowUpRight size={17} aria-hidden="true" /></span>
                            <span className="home-project-description">에세이를 기고하고 교육과 멘토링에도 참여하고 있습니다</span>
                        </Link>
                    </aside>
                </header>
            ) : (
                <header className="home-category-header">
                    <Link to="/" className="home-text-link">전체 글로 돌아가기</Link>
                    <h1>{categoryName}</h1>
                    <p>직접 경험한 문제와 해결 과정을 기록합니다.</p>
                </header>
            )}

            <AnimatePresence>
                {isRecapOpen && <RecapStory onClose={closeRecap} />}
            </AnimatePresence>

            <section id="posts" className="content-container home-posts" aria-labelledby="home-posts-title" aria-busy={loading}>
                <div className="home-posts-heading">
                    <div><h2 id="home-posts-title">{categoryName ? '카테고리 글' : '최근 글'}</h2></div>
                    <Link to="/search" className="home-text-link"><Search size={16} aria-hidden="true" /> 글 검색</Link>
                </div>
                {loading ? (
                    <PostListSkeleton count={6} />
                ) : error ? (
                    <div className="home-list-state" role="status">
                        <h3>글을 잠시 불러올 수 없어요.</h3>
                        <p>{error}</p>
                        <button className="home-button home-button-secondary" onClick={() => setRetryCount(count => count + 1)}><RotateCcw size={15} aria-hidden="true" /> 다시 불러오기</button>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="home-list-state" role="status"><h3>아직 등록된 글이 없습니다.</h3><p>새로운 기록이 올라오면 이곳에서 만나보세요.</p></div>
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
                                                    aria-label={(i + 1) + '페이지'}
                                                    aria-current={i === page ? 'page' : undefined}
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
            </section>
        </div>
    );
};

export default Home;
