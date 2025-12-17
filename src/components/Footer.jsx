import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>About NARUBROWN's Blog</h3>
                        <p>
                            이 사이트는 백엔드 엔지니어 김원정의 포트폴리오이자 기술 기록 공간입니다.
                            실무에서 마주한 문제와 그 해결 과정을 구조와 코드로 정리합니다.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About Me</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Connect</h3>
                        <ul className="footer-links">
                            <li><a href="https://github.com/NARUBROWN" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                            <li><a href="https://linkedin.com/in/naru-brown" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} 김원정. 사랑을 담아서 만들었습니다.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
