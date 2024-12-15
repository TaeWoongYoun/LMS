import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

function PostEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const userId = localStorage.getItem('userId');
    const initialPost = location.state?.post;

    useEffect(() => {
        if (initialPost) {
            setTitle(initialPost.title);
            setContent(initialPost.content);
        }
    }, [initialPost]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            setError('제목과 내용을 모두 입력해주세요.');
            return;
        }

        try {
            await axios.put(`http://localhost:3001/api/posts/${id}`, {
                title,
                content,
                author_id: userId
            });

            navigate(`/postdetail/${id}`);
        } catch (error) {
            setError('게시글 수정에 실패했습니다.');
        }
    };

    if (!initialPost) {
        return <div className="error">게시글을 찾을 수 없습니다.</div>;
    }

    return (
        <div className="write-container">
            <div className="write-box">
                <h1>게시글 수정</h1>
                <form onSubmit={handleSubmit}>
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
                            수정하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostEditPage;