import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import './styles/BoardPage.css';

function BoardPage() {
    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        fetchPosts();
    }, [category]);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:3001/api/posts', {
                params: { 
                    category: category === 'all' ? null : category,
                    search 
                }
            });
            setPosts(response.data);
        } catch (error) {
            setError('게시글을 불러오는데 실패했습니다.');
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts();
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

    if (!localStorage.getItem('token')) {
        return <Navigate to="/" />;
    }

    return (
        <div className="board-container">
            <div className="board-header">
                <h1>게시판</h1>
                <div className="category-tabs">
                    <button 
                        className={`tab ${category === 'all' ? 'active' : ''}`}
                        onClick={() => setCategory('all')}
                    >
                        전체
                    </button>
                    <button 
                        className={`tab ${category === 'news' ? 'active' : ''}`}
                        onClick={() => setCategory('news')}
                    >
                        최신 뉴스
                    </button>
                    <button 
                        className={`tab ${category === 'qna' ? 'active' : ''}`}
                        onClick={() => setCategory('qna')}
                    >
                        Q&A
                    </button>
                    <button 
                        className={`tab ${category === 'free' ? 'active' : ''}`}
                        onClick={() => setCategory('free')}
                    >
                        자유게시판
                    </button>
                    {userRole === 'admin' && (
                        <button 
                            className={`tab ${category === 'notice' ? 'active' : ''}`}
                            onClick={() => setCategory('notice')}
                        >
                            공지사항
                        </button>
                    )}
                </div>
            </div>

            <div className="board-actions">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="검색어를 입력하세요"
                    />
                    <button type="submit">검색</button>
                </form>
                {((category === 'notice' && userRole === 'admin') || 
                  category !== 'notice') && (
                    <button 
                        onClick={() => navigate('/writepost', { state: { category }})}
                        className="write-button"
                    >
                        글쓰기
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="loading">로딩 중...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="board-content">
                    <table>
                        <thead>
                            <tr>
                                <th width="10%">번호</th>
                                <th width="50%">제목</th>
                                <th width="15%">작성자</th>
                                <th width="25%">작성일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id}>
                                    <td>{post.id}</td>
                                    <td className="title">
                                        <Link to={`/postdetail/${post.id}`}>
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td>{post.author_name}</td>
                                    <td>{formatDate(post.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default BoardPage;