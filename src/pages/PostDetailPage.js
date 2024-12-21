import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/PostDetailPage.css';
import { API_URL } from '../config/config';

function PostDetailPage() {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/posts/${id}`);
                setPost(response.data);
                const commentsResponse = await axios.get(`${API_URL}/api/posts/${id}/comments`);
                setComments(commentsResponse.data);
            } catch (error) {
                setError('게시글을 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('정말로 삭제하시겠습니까?')) return;

        try {
            await axios.delete(`${API_URL}/api/posts/${id}`, {
                data: { author_id: userId }
            });
            navigate('/board');
        } catch (error) {
            setError('게시글 삭제에 실패했습니다.');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await axios.post(`${API_URL}/api/posts/${id}/comments`, {
                content: newComment,
                author_id: userId,
                author_name: userName
            });

            setComments([response.data, ...comments]);
            setNewComment('');
        } catch (error) {
            setError('댓글 작성에 실패했습니다.');
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            await axios.delete(`${API_URL}/api/comments/${commentId}`, {
                data: { author_id: userId }
            });
            setComments(comments.filter(comment => comment.id !== commentId));
        } catch (error) {
            setError('댓글 삭제에 실패했습니다.');
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
                
                <div className="comments-section">
                    <h3>댓글</h3>

                    <div className="comments-list">
                        {comments.map((comment) => (
                            <div key={comment.id} className="comment">
                                <div className="comment-header">
                                    <span className="comment-author">{comment.author_name}</span>
                                    <div className="comment-content">
                                        {comment.content}
                                    </div>
                                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                                    {comment.author_id === userId && (
                                        <button 
                                            onClick={() => handleCommentDelete(comment.id)}
                                            className="delete-button"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 입력하세요"
                            className="comment-input"
                        />
                        <button type="submit" className="comment-submit">댓글 작성</button>
                    </form>
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