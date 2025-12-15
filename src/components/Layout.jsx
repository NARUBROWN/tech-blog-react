import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <footer className="footer">
                <div className="container">
                    <p>© 2024 TechBlog. Built with React & Vite.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
