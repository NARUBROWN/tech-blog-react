import './RecapBanner.css';

const RecapBanner = ({ onClick }) => {
    return (
        <div className="recap-banner-wrapper">
            <div className="recap-banner" onClick={onClick}>
                <div className="recap-banner-content">
                    <div className="recap-icon-circle">
                        <span>✨</span>
                    </div>
                    <div className="recap-text-group">
                        <span className="recap-title">2025년 돌아보기</span>
                        <span className="recap-desc">올해의 여정을 확인해보세요</span>
                    </div>
                </div>
                <div className="recap-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default RecapBanner;
