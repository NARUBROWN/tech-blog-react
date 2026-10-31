import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenSquare, LogOut, User, ChevronDown, FolderPlus, Settings, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategoryList } from '../api/category';

import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [categories, setCategories] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const activeCategory = searchParams.get('categoryName');
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const canWritePost = user?.role === 'ROLE_AUTHOR' || user?.role === 'ROLE_ADMIN';

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
        <nav className="navbar" aria-label="주 메뉴">
            <div className="navbar-content">
                <Link to="/" className="navbar-logo">
                    {/* Using an emoji or icon as placeholder if logo image not fitting well, but keeping image as requested */}
                    <img src="/logo.png" alt="Logo" className="navbar-logo-image" />
                    {<span>NARUBROWN</span>}
                </Link>

                <div className="navbar-categories">
                    <NavLink
                        to="/"
                        end
                        className={() => (location.pathname === '/' && !activeCategory ? "nav-category active" : "nav-category")}
                    >
                        전체
                    </NavLink>
                    {categories.map((category) => (
                        <NavLink
                            key={category.id}
                            to={`/?categoryName=${category.name}`}
                            className={() => (location.pathname === '/' && activeCategory === category.name ? "nav-category active" : "nav-category")}
                        >
                            {category.name}
                        </NavLink>
                    ))}
                </div>

                <div className="navbar-links">
                    {user ? (
                        <div className="user-dropdown-container">
                            <button
                                className="user-menu-trigger"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt={user.username} className="user-avatar-nav" />
                                ) : (
                                    <User size={16} />
                                )}
                                <span className="user-name">{user.username || user.email}</span>
                                <ChevronDown size={14} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    {canWritePost && (
                                        <Link
                                            to="/post/create"
                                            className="dropdown-item"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <PenSquare size={16} />
                                            <span>글 작성</span>
                                        </Link>
                                    )}

                                    {isAdmin && (
                                        <Link
                                            to="/category/create"
                                            className="dropdown-item"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <FolderPlus size={16} />
                                            <span>카테고리 추가</span>
                                        </Link>
                                    )}

                                    {isAdmin && <Link to="/admin/analytics" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}><BarChart3 size={16} /><span>방문 통계</span></Link>}
                                    <Link
                                        to="/settings"
                                        className="dropdown-item"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <Settings size={16} />
                                        <span>설정</span>
                                    </Link>

                                    <div className="dropdown-divider"></div>

                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsDropdownOpen(false);
                                        }}
                                        className="dropdown-item logout-item"
                                    >
                                        <LogOut size={16} />
                                        <span>로그아웃</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="nav-category">로그인</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
