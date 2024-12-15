import React from 'react';
import './styles/WelcomePage.css';
import { Navigate } from 'react-router-dom';

function WelcomePage() {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/" />;
    }

    return (
        <div className="welcome-container">
            <div className="profile-box">
                <div className="profile-header">
                    <div className="profile-image">
                        <div className="profile-initial">Y</div>
                    </div>
                    <div className="profile-info">
                        <h1>TaeWoong Youn</h1>
                        <p className="username">@TaeWoongYoun</p>
                        <p className="bio">Web Developer | W-LMS Project Creator</p>
                    </div>
                </div>

                <div className="stats-section">
                    <h2>프로젝트 이름</h2>
                    <div className="stat-item">
                        <span className="stat-icon">📚</span>
                        <span>Web Learning Management System</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">💻</span>
                        <span>웹 개발 학습을 위한 과제 관리 시스템</span>
                    </div>
                </div>

                <div className="about-section">
                    <h2>시스템 소개</h2>
                    <p>
                        W-LMS는 전공동아리 후배들을 위한 웹 학습 관리 시스템입니다.
                        기초부터 심화까지 단계별로 구성된 과제들을 통해 체계적인 학습이 가능하며
                        GitHub 연동을 통해 효율적으로 코드를 관리할 수 있습니다.
                    </p>
                </div>

                <div className="features-section">
                    <h2>주요 기능</h2>
                    <div className="stats-section">
                        <div className="stat-item">
                            <span className="stat-icon">🎯</span>
                            <span>레벨별 맞춤형 과제</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">📝</span>
                            <span>과제 제출 및 관리</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">🔗</span>
                            <span>GitHub 연동</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">🏆</span>
                            <span>랭킹 시스템</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WelcomePage;