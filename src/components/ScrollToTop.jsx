import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname, hash, key } = useLocation();

    useEffect(() => {
        const section = hash && document.getElementById(hash.slice(1));
        if (section) {
            section.scrollIntoView({ block: 'start' });
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname, hash, key]);

    return null;
};

export default ScrollToTop;
