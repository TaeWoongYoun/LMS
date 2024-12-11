import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/RankPage.css';
import bronzeImg from '../assets/bronze.png';
import silverImg from '../assets/silver.png';
import goldImg from '../assets/gold.png';
import platinumImg from '../assets/platinum.png';
import diamondImg from '../assets/diamond.png';
import seraphim from '../assets/seraphim.png'

function RankPage() {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('myTier');
    const [currentUser, setCurrentUser] = useState(null);

    const tierImages = {
        브론즈: bronzeImg,
        실버: silverImg,
        골드: goldImg,
        플래티넘: platinumImg,
        다이아몬드: diamondImg,
        세라핌: seraphim
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rankingsResponse = await axios.get('http://localhost:3001/api/rankings');
                setRankings(rankingsResponse.data);
                
                // userId로 현재 사용자 찾기
                const userId = localStorage.getItem('userId');
                const userInfo = rankingsResponse.data.find(user => user.id === userId);
                setCurrentUser(userInfo);
                setLoading(false);
            } catch (error) {
                console.error('데이터 로딩 실패:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="loading">로딩 중...</div>;
    }

    return (
        <div className="rank-container">
            <div className="tab-container">
                <button 
                    className={`tab-button ${activeTab === 'myTier' ? 'active' : ''}`}
                    onClick={() => setActiveTab('myTier')}
                >
                    내 티어
                </button>
                <button 
                    className={`tab-button ${activeTab === 'ranking' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ranking')}
                >
                    전체 랭킹
                </button>
            </div>

            {activeTab === 'myTier' && currentUser && (
                <div className="my-tier-container">
                    <div className="tier-image-container">
                        <img 
                            src={tierImages[currentUser.tier]} 
                            alt={`${currentUser.tier} 티어`} 
                            className="tier-image"
                        />
                    </div>
                    <div className="tier-info">
                        <h2>{currentUser.name}님의 티어는 현재 {currentUser.tier} 입니다.</h2>
                        <p className="tier-details">
                            현재 점수: {currentUser.total_score}점<br />
                            완료한 과제: {currentUser.completed_assignments}개<br />
                            {currentUser.nextTier ? 
                                `다음 티어까지 ${currentUser.nextTier.remainingScore}점 남았습니다!` : 
                                '축하합니다! 최고 티어에 도달하셨습니다!'}
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'ranking' && (
                <div className="rank-table-container">
                    <table className="rank-table">
                        <thead>
                            <tr>
                                <th>순위</th>
                                <th>이름</th>
                                <th>티어</th>
                                <th>점수</th>
                                <th>완료한 과제</th>
                                <th>다음 티어까지</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.map((user) => (
                                <tr 
                                    key={user.id} 
                                    className={`tier-${user.tier?.toLowerCase()} ${user.id === localStorage.getItem('userId') ? 'current-user' : ''}`}
                                >
                                    <td>{user.rank}</td>
                                    <td>{user.name}</td>
                                    <td>{user.tier}</td>
                                    <td>{user.total_score}</td>
                                    <td>{user.completed_assignments}</td>
                                    <td>
                                        {user.nextTier ? 
                                            `${user.nextTier.name}까지 ${user.nextTier.remainingScore}점` : 
                                            '최고 티어'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default RankPage;