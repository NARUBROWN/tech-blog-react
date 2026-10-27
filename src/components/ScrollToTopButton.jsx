import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import './ScrollToTopButton.css';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 280);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
    };

    return (
        <button
            type="button"
            className={`scroll-top ${isVisible ? 'visible' : ''}`}
            onClick={scrollToTop}
            aria-label="맨 위로 이동"
            aria-hidden={!isVisible}
            inert={!isVisible}
        >
            <ArrowUp size={18} />
            <span>맨 위로</span>
        </button>
    );
};

export default ScrollToTopButton;
