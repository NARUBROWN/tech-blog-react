import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenSquare, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategoryList } from '../api/category';
import { useRef } from 'react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [categories, setCategories] = useState([]);
    const [isVisible, setIsVisible] = useState(true);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const activeCategory = searchParams.get('categoryName');
    const isAdmin = user?.role === 'ROLE_ADMIN';

    const lastScrollY = useRef(0);
    const hideTimer = useRef(null);
    const isMouseAtTop = useRef(false);

    // Auto-hide logic
    useEffect(() => {
        const isMainPage = location.pathname === '/';
        if (isMainPage) {
            setIsVisible(true);
            if (hideTimer.current) clearTimeout(hideTimer.current);
            return;
        }

        const resetTimer = () => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
            if (!isMouseAtTop.current) {
                hideTimer.current = setTimeout(() => {
                    setIsVisible(false);
                }, 5000);
            }
        };

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // If scrolling up, show navbar and reset timer
            if (currentScrollY < lastScrollY.current) {
                setIsVisible(true);
                resetTimer();
            } else {
                // If scrolling down and timer not running, ensure it starts
                // But we don't want to reset it constantly if it's already running?
                // Actually, if we just rely on the initial timer or the one set by "mouse leave",
                // we might miss starting it if we started scrolling down from a static state.
                // Safest to just resetTimer (extends visibility by 5s from NOW).
                // But prompt says "5s behind". If I continuously scroll down, should it stay visible?
                // "scrolling up... NOT scrolling up... hide".
                // If I am scrolling down, I am NOT scrolling up. So it should hide.
                // If I resetTimer here, it will never hide while I actvely scroll down.
                // So on scroll down, we do NOT reset timer. We only start it if it's missing?
                // Let's assume on mount we start timer.
                // So we only resetTimer on UP or MOUSE activity.
                if (!hideTimer.current && isVisible) {
                    resetTimer();
                }
            }
            lastScrollY.current = currentScrollY;
        };

        const handleMouseMove = (e) => {
            if (e.clientY < 150) {
                isMouseAtTop.current = true;
                setIsVisible(true);
                if (hideTimer.current) clearTimeout(hideTimer.current);
                hideTimer.current = null;
            } else {
                if (isMouseAtTop.current) {
                    // Just left the top area
                    isMouseAtTop.current = false;
                    resetTimer();
                }
            }
        };

        // Initialize timer
        resetTimer();

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, [location.pathname]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoryList();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <nav className={`navbar ${!isVisible ? 'hidden' : ''}`}>
            <div className="navbar-content">
                <Link to="/" className="navbar-logo">
                    {/* Using an emoji or icon as placeholder if logo image not fitting well, but keeping image as requested */}
                    <img src="/logo.png" alt="Logo" className="navbar-logo-image" />
                    {/* <span>TechBlog</span> - Removed text to match "Logo" style in prompt if needed, but keeping simplistic */}
                </Link>

                <div className="navbar-categories">
                    <NavLink
                        to="/"
                        end
                        className={() => (!activeCategory ? "nav-category active" : "nav-category")}
                    >
                        All
                    </NavLink>
                    {categories.map((category) => (
                        <NavLink
                            key={category.id}
                            to={`/?categoryName=${category.name}`}
                            className={() => (activeCategory === category.name ? "nav-category active" : "nav-category")}
                        >
                            {category.name}
                        </NavLink>
                    ))}
                </div>

                <div className="navbar-links">
                    {user ? (
                        <div className="user-menu">
                            {isAdmin && (
                                <Link to="/category/create" className="btn btn-primary" title="Create category">
                                    Add Category
                                </Link>
                            )}
                            {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt={user.username} className="user-avatar-nav" />
                            ) : (
                                <User size={16} />
                            )}
                            <span className="user-name">{user.username || user.email}</span>
                            <button onClick={logout} className="btn-icon" title="Logout">
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="nav-category">Login</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
