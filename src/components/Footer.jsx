import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>About TechBlog</h3>
                        <p>
                            Sharing the latest in web development, React ecosystem, and software engineering practices.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Connect</h3>
                        <ul className="footer-links">
                            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                            <li><a href="/rss.xml">RSS Feed</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} TechBlog. Built with React & Vite.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
