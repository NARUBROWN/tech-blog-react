
import React from 'react';
import { X, Linkedin, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import './RecruitmentSnackbar.css';

const RecruitmentSnackbar = ({ isVisible, onClose }) => {
    return (
        <div className={`recruitment-snackbar ${isVisible ? 'visible' : ''}`} role="status" aria-hidden={!isVisible} inert={!isVisible}>
            <div className="snackbar-header">
                <button
                    className="close-btn"
                    onClick={onClose}
                    aria-label="자기소개서 안내 닫기"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="snackbar-content">
                <div className="snackbar-text">
                    <p className="snackbar-message">
                        <span className="snackbar-lead">여기까지 읽으셨다면,</span>
                        제 문제 해결 방식이 마음에 드셨을지도 모르겠습니다.
                    </p>
                    <p className="snackbar-subtext">
                        같은 팀에서 함께 풀어보고 싶습니다.
                    </p>

                    <div className="snackbar-tags" aria-label="핵심 강점">
                        <span>빠른 문제 해결</span>
                        <span>장애 예방</span>
                        <span>안정적인 서비스 개발</span>
                    </div>
                </div>
            </div>

            <div className="cta-row">
                <Link to="/about" className="about-btn">
                    <User size={16} />
                    자기소개서 보기
                </Link>
                <a
                    href="https://www.linkedin.com/in/naru-brown/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkedin-btn"
                >
                    <Linkedin size={16} />
                    LinkedIn으로 연락하기
                    <span className="cta-arrow" aria-hidden="true">→</span>
                </a>
            </div>
        </div>
    );
};

export default RecruitmentSnackbar;
