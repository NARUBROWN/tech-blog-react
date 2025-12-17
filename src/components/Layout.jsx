import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTopButton from './ScrollToTopButton';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <ScrollToTopButton />
            <Footer />
        </div>
    );
};

export default Layout;
