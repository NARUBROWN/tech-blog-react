import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-brand">
                            <img src="/logo.png" alt="" aria-hidden="true" />
                            <span>NARUBROWN의 기술 블로그</span>
                        </h3>
                        <p>
                            실무에서 마주한 문제와 그 해결 과정을 글로 정리합니다.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h3>빠른 링크</h3>
                        <ul className="footer-links">
                            <li><Link to="/">홈</Link></li>
                            <li><Link to="/about">자기소개서</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>연락처</h3>
                        <ul className="footer-links">
                            <li><a href="https://github.com/NARUBROWN" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                            <li><a href="https://linkedin.com/in/naru-brown" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} 김원정. 사랑을 담아서 만들었습니다. ❤️</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
