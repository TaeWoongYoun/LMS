import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/PostDetailPage.css';

function PostDetailPage() {
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const viewedKey = `post_${id}_viewed`;
 
    useEffect(() => {
        const fetchPost = async () => {
            // 이미 조회한 게시글인지 확인
            if (sessionStorage.getItem(viewedKey)) {
                try {
                    const response = await axios.get(`http://localhost:3001/api/posts/${id}?skipViewCount=true`);
                    setPost(response.data);
                } catch (error) {
                    setError('게시글을 불러오는데 실패했습니다.');
                } finally {
                    setIsLoading(false);
                }
                return;
            }
 
            try {
                const response = await axios.get(`http://localhost:3001/api/posts/${id}`);
                setPost(response.data);
                // 조회 기록 저장
                sessionStorage.setItem(viewedKey, 'true');
            } catch (error) {
                setError('게시글을 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
 
        fetchPost();
    }, [id, viewedKey]);
 
    const handleDelete = async () => {
        if (!window.confirm('정말로 삭제하시겠습니까?')) return;
 
        try {
            await axios.delete(`http://localhost:3001/api/posts/${id}`, {
                data: { author_id: userId }
            });
            navigate('/board');
        } catch (error) {
            setError('게시글 삭제에 실패했습니다.');
        }
    };
 
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
 
    if (isLoading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!post) return <div className="error">게시글을 찾을 수 없습니다.</div>;
 
    return (
        <div className="post-detail-container">
            <div className="post-detail-box">
                <div className="post-header">
                    <h1>{post.title}</h1>
                    <div className="post-info">
                        <span>작성자: {post.author_name}</span>
                        <span>작성일: {formatDate(post.created_at)}</span>
                    </div>
                </div>
                <div className="post-content">
                    {post.content}
                </div>
                <div className="button-group">
                    <button onClick={() => navigate('/board')} className="back-button">
                        목록으로
                    </button>
                    {post.author_id === userId && (
                        <>
                            <button 
                                onClick={() => navigate(`/postedit/${id}`, { state: { post }})} 
                                className="edit-button"
                            >
                                수정
                            </button>
                            <button onClick={handleDelete} className="delete-button">
                                삭제
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
 }

export default PostDetailPage;