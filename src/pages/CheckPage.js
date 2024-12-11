import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import './styles/CheckPage.css';

const CheckPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
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

    const handleCheck = async (submission) => {
        if (window.confirm('과제를 확인하셨습니까? 확인된 과제는 목록에서 삭제됩니다.')) {
            try {
                const response = await fetch('http://localhost:3001/api/complete-assignment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: submission.user_id,  // name 대신 id 사용
                        assignmentName: submission.assignment_name
                    }),
                });

                if (response.ok) {
                    setSubmissions(submissions.filter(s => 
                        !(s.user_id === submission.user_id && 
                        s.assignment_name === submission.assignment_name)
                    ));
                    alert('과제가 확인 처리되었습니다.');
                } else {
                    const data = await response.json();
                    alert(data.error || '과제 확인 처리 중 오류가 발생했습니다.');
                }
            } catch (error) {
                alert('과제 확인 처리 중 오류가 발생했습니다.');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'manager') {
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
                <h1>과제 제출 목록</h1>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>유저 이름</th>
                                <th>과제명</th>
                                <th>제출 시간</th>
                                <th>설명</th>
                                <th>과제 확인</th>
                                <th>제출물 확인</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((submission) => (<tr key={submission.idx}>
                                <td>{submission.user_name}</td>
                                <td>{submission.assignment_name}</td>
                                <td>{formatDate(submission.submit_time)}</td>
                                <td>{submission.description}</td>
                                <td>
                                    <button 
                                        className="preview-btn"
                                        onClick={() => {
                                            setSelectedAssignment(submission.assignment_path);
                                            setShowPreviewModal(true);
                                        }}
                                    >과제 보기</button>
                                </td>
                                <td>
                                    <button 
                                        className="view-image-btn"
                                        onClick={() => {
                                            setSelectedImage(submission.image_path);
                                            setShowImageModal(true);
                                        }}
                                    >제출물 보기</button>
                                </td>
                                <td>
                                    <button 
                                        className="check-btn"
                                        onClick={() => handleCheck(submission)}
                                    >과제 확인</button>
                                </td>
                            </tr>))}
                        </tbody>
                    </table>
                </div>
            </div>
    
            {/* 제출물 이미지 모달 */}
            {showImageModal && (
                <div className="modal-backdrop" onClick={() => setShowImageModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <img 
                            src={`http://localhost:3001${selectedImage}`} 
                            alt="Submission" 
                            className="modal-image"
                        />
                        <button 
                            className="modal-close-button"
                            onClick={() => setShowImageModal(false)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}

            {/* 과제 미리보기 모달 */}
            {showPreviewModal && (
                <div className="modal-backdrop" onClick={() => setShowPreviewModal(false)}>
                    <div className="modal-content preview-modal" onClick={e => e.stopPropagation()}>
                        <iframe 
                            src={selectedAssignment}
                            title="Assignment Preview"
                            className="preview-iframe"
                        />
                        <button 
                            className="modal-close-button"
                            onClick={() => setShowPreviewModal(false)}
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