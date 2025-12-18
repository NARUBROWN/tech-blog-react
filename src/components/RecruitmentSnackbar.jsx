
import React from 'react';
import { X, Linkedin } from 'lucide-react';
import './RecruitmentSnackbar.css';

const RecruitmentSnackbar = ({ isVisible, onClose }) => {
    return (
        <div className={`recruitment-snackbar ${isVisible ? 'visible' : ''}`} role="alert">
            <div className="snackbar-hero">
                <span className="signal-dot" aria-hidden="true" />
                <span className="snackbar-kicker">여보세요? 제 말이 들리나요?</span>
            </div>

            <div className="snackbar-content">
                <div className="snackbar-text">
                    <p className="snackbar-message">
                        여기까지 읽으셨다면,<br />
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
                <button
                    className="close-btn"
                    onClick={onClose}
                    aria-label="Close recruitment offer"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="cta-row">
                <a
                    href="https://www.linkedin.com/in/naru-brown/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkedin-btn"
                >
                    <Linkedin size={18} />
                    LinkedIn으로 연락하기
                    <span className="cta-arrow" aria-hidden="true">→</span>
                </a>
            </div>
        </div>
    );
};

export default RecruitmentSnackbar;
