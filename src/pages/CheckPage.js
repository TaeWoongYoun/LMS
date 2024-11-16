import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import './styles/CheckPage.css';

const CheckPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        console.log("현재 권한:", userRole); // 권한 확인용

        if (userRole === 'admin' || userRole === 'manager') {
            fetchSubmissions();
        }
        setLoading(false);
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/submissions');
            const data = await response.json();
            setSubmissions(data);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    // 단순화된 권한 체크
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'manager') {
        console.log("접근 거부됨. 현재 권한:", userRole);  // 디버깅용
        return <Navigate to="/" />;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="check-page">
            <div className="content">
                <h1>과제 제출 목록</h1>  {/* 권한 표시 추가 */}
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>유저 이름</th>
                                <th>제출 시간</th>
                                <th>설명</th>
                                <th>이미지</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((submission) => (
                                <tr key={submission.idx}>
                                    <td>{submission.user_name}</td>
                                    <td>{formatDate(submission.submit_time)}</td>
                                    <td>{submission.description}</td>
                                    <td>
                                        <button 
                                            className="view-image-btn"
                                            onClick={() => {
                                                setSelectedImage(submission.image_path);
                                                setShowModal(true);
                                            }}
                                        >
                                            이미지 보기
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <img 
                            src={`http://localhost:3001${selectedImage}`} 
                            alt="Submission" 
                            className="modal-image"
                        />
                        <button 
                            className="modal-close-button"
                            onClick={() => setShowModal(false)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckPage;