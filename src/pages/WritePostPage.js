import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './styles/WritePostPage.css';

function WritePostPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [category, setCategory] = useState(location.state?.category || 'free');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
 
    const handleSubmit = async (e) => {
        e.preventDefault();
 
        if (!title.trim() || !content.trim()) {
            setError('제목과 내용을 모두 입력해주세요.');
            return;
        }
 
        try {
            await axios.post('http://10.142.46.1:3001/api/posts', {
                category,
                title,
                content,
                author_id: userId,
                author_name: userName
            });
 
            navigate('/board');
        } catch (error) {
            setError('게시글 작성에 실패했습니다.');
            console.error('Error posting:', error);
        }
    };
 
    if (!localStorage.getItem('token')) {
        return <Navigate to="/" />;
    }
 
    return (
        <div className="write-container">
            <div className="write-box">
                <h1>게시글 작성</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="category-select"
                        >
                            <option value="free">자유게시판</option>
                            <option value="qna">Q&A</option>
                            <option value="news">최신 뉴스</option>
                            {userRole === 'admin' && (
                                <option value="notice">공지사항</option>
                            )}
                        </select>
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            placeholder="내용을 입력하세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={15}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="button-group">
                        <button type="button" onClick={() => navigate(-1)} className="cancel-button">
                            취소
                        </button>
                        <button type="submit" className="submit-button">
                            작성하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
 }

export default WritePostPage;