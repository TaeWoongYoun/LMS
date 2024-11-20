import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/RankPage.css';

function RankPage() {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchRankings = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/rankings');
            setRankings(response.data);
            setLoading(false);
        } catch (error) {
            console.error('랭킹 데이터 로딩 실패:', error);
            setLoading(false);
        }
    };

    fetchRankings();
}, []);

if (loading) {
    return <div className="loading">로딩 중...</div>;
}

return (
    <div className="rank-container">
        <h1 className="rank-title">랭킹</h1>
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
                    <tr key={user.id} className={`tier-${user.tier?.toLowerCase()}`}>
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
</div>
);
}

export default RankPage;