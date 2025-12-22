import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RecapStory.css';
import { recapData } from '../../data/recapData';

// --- Animation Variants ---

const slideHorizontalVariants = {
    enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95,
        filter: 'blur(4px)',
        zIndex: 1
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        zIndex: 1
    },
    exit: (direction) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95,
        filter: 'blur(4px)',
        zIndex: 0
    })
};

const scaleFadeVariants = {
    enter: {
        opacity: 0,
        scale: 0.85,
        filter: 'blur(8px)',
        zIndex: 1
    },
    center: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        zIndex: 1
    },
    exit: {
        opacity: 0,
        scale: 1.1,
        filter: 'blur(8px)',
        zIndex: 0
    }
};

const blurFadeVariants = {
    enter: {
        opacity: 0,
        filter: 'blur(12px)',
        scale: 1.02,
        zIndex: 1
    },
    center: {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        zIndex: 1
    },
    exit: {
        opacity: 0,
        filter: 'blur(12px)',
        scale: 1.02,
        zIndex: 0
    }
};

// --- Helper to select variant ---
const getTransitionVariants = (type) => {
    switch (type) {
        case 'cover':
        case 'outro':
            return scaleFadeVariants;
        case 'keywords':
        case 'thought':
            return blurFadeVariants;
        case 'standard':
        case 'comparison':
        case 'list':
        case 'timeline':
        case 'preview':
        default:
            return slideHorizontalVariants;
    }
};

const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const ContentWrapper = ({ children, className = "" }) => (
    <motion.div
        className={className}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
    >
        {children}
    </motion.div>
);

const AnimatedItem = ({ children, className = "" }) => (
    <motion.div variants={contentVariants} className={className}>
        {children}
    </motion.div>
);

const RecapStory = ({ onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isPressPaused, setIsPressPaused] = useState(false);

    const handleNext = () => {
        if (currentIndex < recapData.length - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        } else {
            setDirection(-1);
            setCurrentIndex(0);
        }
    };

    const handleShare = async () => {
        const blogUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
        blogUrl.searchParams.set('recap', 'true');
        try {
            await navigator.clipboard.writeText(blogUrl.toString());
            alert('홈페이지 주소가 복사되었습니다! ✨');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleReplay = () => {
        setDirection(-1);
        setCurrentIndex(0);
        setIsPaused(false);
        setIsPressPaused(false);
    };

    const handleContainerClick = (event) => {
        if (event.target.closest('button, a, input, textarea, select, .recap-header, .recap-actions')) {
            return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - bounds.left;
        const leftZoneEnd = bounds.width * 0.47;
        const rightZoneStart = bounds.width * 0.53;

        if (clickX <= leftZoneEnd) {
            setIsPaused(false);
            setIsPressPaused(false);
            handlePrev();
        } else if (clickX >= rightZoneStart) {
            setIsPaused(false);
            setIsPressPaused(false);
            handleNext();
        } else {
            setIsPaused(prev => !prev);
        }
    };

    const slide = recapData[currentIndex];
    const variants = useMemo(() => getTransitionVariants(slide.type), [slide.type]);
    const isPlaybackPaused = isPaused || isPressPaused;

    // Render Helpers
    const iconMap = {
        cover: ['✨', '📘', '🧭'],
        list: ['📌', '🛠️', '🗂️'],
        keywords: ['🔍', '⚡', '🧠'],
        timeline: ['🗓️', '🛰️', '📍'],
        thought: ['💭', '🧩', '🧪'],
        comparison: ['⬅️', '⚖️', '➡️'],
        standard: ['📐', '✅', '🧱'],
        preview: ['🔮', '🌱', '🧭'],
        outro: ['🎯', '🫶', '🌌'],
        default: ['✨', '📍', '🧭']
    };

    const listIconMap = {
        list: ['✅', '🧩', '📈', '🧠', '🗂️'],
        thought: ['💡', '🧭', '🧠'],
        preview: ['🚀', '🧩', '🧭']
    };

    const keywordIcons = ['🛰️', '🧠', '⚙️', '⚡', '📚'];
    const comparisonIcons = {
        before: ['⏳', '🧱', '🙈'],
        after: ['✅', '📊', '✨']
    };

    const renderContent = (slide) => {
        const renderIconRow = (type) => {
            const icons = iconMap[type] || iconMap.default;
            return (
                <AnimatedItem className="slide-icon-row">
                    {icons.map((icon, idx) => (
                        <span key={`${type}-${idx}`} className="slide-icon" aria-hidden="true">{icon}</span>
                    ))}
                </AnimatedItem>
            );
        };

        const renderIconList = (items, icons, className) => (
            <ul className={className}>
                {items.map((item, idx) => (
                    <AnimatedItem key={idx}>
                        <li>
                            <span className="list-icon" aria-hidden="true">{icons[idx % icons.length]}</span>
                            <span className="list-text">{item}</span>
                        </li>
                    </AnimatedItem>
                ))}
            </ul>
        );

        switch (slide.type) {
            case 'cover':
                return (
                    <ContentWrapper className="slide-cover">
                        {renderIconRow('cover')}
                        <AnimatedItem><h1>{slide.title}</h1></AnimatedItem>
                        <AnimatedItem><p>{slide.subtitle}</p></AnimatedItem>
                    </ContentWrapper>
                );
            case 'list':
                return (
                    <ContentWrapper className="slide-list">
                        {renderIconRow('list')}
                        <AnimatedItem><h2>{slide.title}</h2></AnimatedItem>
                        {renderIconList(slide.items, listIconMap.list)}
                        {slide.note && <AnimatedItem><div className="recap-note">{slide.note}</div></AnimatedItem>}
                    </ContentWrapper>
                );
            case 'keywords':
                return (
                    <ContentWrapper className="slide-keywords">
                        {renderIconRow('keywords')}
                        <AnimatedItem><h2>{slide.title}</h2></AnimatedItem>
                        {slide.keywords.map((kw, idx) => (
                            <AnimatedItem key={idx} className="keyword-item">
                                <div className="keyword-header">
                                    <span className="keyword-icon" aria-hidden="true">{keywordIcons[idx % keywordIcons.length]}</span>
                                    <span className="keyword-word">{kw.word}</span>
                                </div>
                                <span className="keyword-desc">{kw.desc}</span>
                            </AnimatedItem>
                        ))}
                    </ContentWrapper>
                );
            case 'timeline':
                return (
                    <ContentWrapper className="slide-timeline">
                        {renderIconRow('timeline')}
                        <AnimatedItem><span className="timeline-date">{slide.date}</span></AnimatedItem>
                        <AnimatedItem><h2>{slide.title}</h2></AnimatedItem>
                        <AnimatedItem><div className="timeline-content">{slide.content}</div></AnimatedItem>
                    </ContentWrapper>
                );
            case 'thought':
                return (
                    <ContentWrapper className="slide-thought">
                        {renderIconRow('thought')}
                        <AnimatedItem><h2>{slide.title}</h2></AnimatedItem>
                        <AnimatedItem><div className="thought-quote">"{slide.quote}"</div></AnimatedItem>
                        {renderIconList(slide.items, listIconMap.thought, 'thought-list')}
                        <AnimatedItem><div className="thought-highlight">{slide.highlight}</div></AnimatedItem>
                    </ContentWrapper>
                );
            case 'comparison':
                return (
                    <ContentWrapper className="slide-comparison">
                        {renderIconRow('comparison')}
                        <AnimatedItem><h2>{slide.title}</h2></AnimatedItem>
                        <AnimatedItem className="comparison-box">
                            <span className="comparison-label">
                                <span className="comparison-icon" aria-hidden="true">⏳</span>
                                {slide.before.label}
                            </span>
                            <ul>
                                {slide.before.items.map((i, idx) => (
                                    <li key={idx}>
                                        <span className="list-icon" aria-hidden="true">{comparisonIcons.before[idx % comparisonIcons.before.length]}</span>
                                        <span className="list-text">{i}</span>
                                    </li>
                                ))}
                            </ul>
                        </AnimatedItem>
                        <AnimatedItem className="comparison-box">
                            <span className="comparison-label">
                                <span className="comparison-icon" aria-hidden="true">🚀</span>
                                {slide.after.label}
                            </span>
                            <ul>
                                {slide.after.items.map((i, idx) => (
                                    <li key={idx}>
                                        <span className="list-icon" aria-hidden="true">{comparisonIcons.after[idx % comparisonIcons.after.length]}</span>
                                        <span className="list-text">{i}</span>
                                    </li>
                                ))}
                            </ul>
                        </AnimatedItem>
                        {slide.note && <AnimatedItem><div className="recap-note">{slide.note}</div></AnimatedItem>}
                    </ContentWrapper>
                );
            case 'standard':
                return (
                    <ContentWrapper className="slide-standard">
                        {renderIconRow('standard')}
                        <AnimatedItem><h2>{slide.title}</h2></AnimatedItem>
                        <AnimatedItem><h3>{slide.heading}</h3></AnimatedItem>
                        <AnimatedItem><p>{slide.content}</p></AnimatedItem>
                    </ContentWrapper>
                );
            case 'preview':
                return (
                    <ContentWrapper className="slide-preview">
                        {renderIconRow('preview')}
                        <AnimatedItem><h2>{slide.title}</h2></AnimatedItem>
                        {renderIconList(slide.items, listIconMap.preview)}
                        <AnimatedItem><div className="recap-note">{slide.quote}</div></AnimatedItem>
                    </ContentWrapper>
                );
            case 'outro':
                return (
                    <ContentWrapper className="slide-outro">
                        {renderIconRow('outro')}
                        <AnimatedItem><h2>{slide.title}</h2></AnimatedItem>
                        <AnimatedItem><p>{slide.content}</p></AnimatedItem>
                        <AnimatedItem>
                            <div className="recap-actions">
                                <button
                                    className="recap-btn btn-primary"
                                    onClick={(e) => { e.stopPropagation(); handleShare(); }}
                                >
                                    내 홈페이지 공유하기 🔗
                                </button>
                                <button
                                    className="recap-btn btn-secondary"
                                    onClick={(e) => { e.stopPropagation(); handleReplay(); }}
                                >
                                    처음부터 다시보기 🔄
                                </button>
                            </div>
                        </AnimatedItem>
                    </ContentWrapper>
                );
            default:
                return <div>{slide.title}</div>;
        }
    };

    return (
        <motion.div
            className="recap-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className="recap-container"
                style={{ background: slide.bgGradient, color: slide.textColor }}
                onClick={handleContainerClick}
                onMouseDown={() => setIsPressPaused(true)}
                onMouseUp={() => setIsPressPaused(false)}
                onTouchStart={() => setIsPressPaused(true)}
                onTouchEnd={() => setIsPressPaused(false)}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                {/* Progress Bars */}
                <div className="recap-progress-bar">
                    {recapData.map((_, idx) => (
                        <div key={idx} className="progress-segment">
                            <div
                                className={`progress-fill ${idx < currentIndex ? 'completed' : ''} ${idx === currentIndex ? 'active' : ''} ${isPlaybackPaused ? 'paused' : ''}`}
                                onAnimationEnd={() => {
                                    if (idx === currentIndex) handleNext();
                                }}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="recap-header">
                    <span className="recap-header-title">2025년 돌아보기</span>
                    <button
                        className="recap-close-btn"
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                    >
                        &times;
                    </button>
                </div>

                {/* Content */}
                <div className="recap-content">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.4 },
                                scale: { duration: 0.4 },
                                filter: { duration: 0.3 }
                            }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative' // Ensure proper stacking
                            }}
                        >
                            {renderContent(slide)}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default RecapStory;
