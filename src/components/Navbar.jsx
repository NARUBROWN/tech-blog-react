import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenSquare, LogOut, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="navbar-logo">
                    TechBlog
                </Link>

                <div className="navbar-links">
                    {user ? (
                        <>
                            <Link to="/post/create" className="btn btn-primary">
                                <PenSquare size={18} />
                                Write
                            </Link>
                            <Link to="/category/create" className="btn btn-ghost">
                                New Category
                            </Link>
                            <div className="user-menu">
                                <span className="user-name">
                                    <User size={18} />
                                    {user.username}
                                </span>
                                <button onClick={logout} className="btn-icon" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Login</Link>
                            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
