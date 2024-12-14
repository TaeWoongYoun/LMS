import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import './styles/DeletePage.css'

function DeletePage() {
    const [searchTerm, setSearchTerm] = useState(''); 
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedModule, setSelectedModule] = useState(''); 
    const [userRole, setUserRole] = useState('');
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        setUserRole(storedRole || '');
        
        const handleLoginChange = () => {
            const storedRole = localStorage.getItem('userRole');
            setUserRole(storedRole || '');
        };
        
        window.addEventListener('loginChange', handleLoginChange);
        return () => {
            window.removeEventListener('loginChange', handleLoginChange);
        };
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const queryParams = new URLSearchParams({
                level: selectedLevel,
                module: selectedModule,
                search: searchTerm
            }).toString();

            const response = await fetch(`http://localhost:3001/api/modules?${queryParams}`);
            if (!response.ok) {
                throw new Error('데이터를 불러오는데 실패했습니다.');
            }

            const moduleData = await response.json();
            setData(moduleData);
            setError(null);
        } catch (err) {
            setError('데이터를 불러오는데 실패했습니다: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [selectedLevel, selectedModule, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 데이터 삭제 처리 수정
    const handleDelete = async (item) => {
        if (window.confirm('정말로 이 데이터를 삭제하시겠습니까?')) {
            try {
                // idx를 사용하여 DELETE 요청
                const response = await fetch(`http://localhost:3001/api/iframe-data/${item.idx}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '삭제 중 오류가 발생했습니다.');
                }

                // 삭제 성공 후 데이터 새로고침
                await fetchData();
                alert('성공적으로 삭제되었습니다.');
            } catch (error) {
                console.error('Delete error:', error);
                alert(error.message || '삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const userRoleFromStorage = localStorage.getItem('userRole');
    if (userRoleFromStorage !== 'admin' && userRoleFromStorage !== 'manager') {
        return <Navigate to="/" />;
    }

    return (
        <div className="data-page">
            <div className="content">
                <>
                    <h1>데이터 관리</h1>
                    <div className='search-area'>
                        <div>
                            <select 
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                            >
                                <option value="">난이도(전체)</option>
                                <option value="0">Lv. 0</option>
                                <option value="1">Lv. 1</option>
                                <option value="2">Lv. 2</option>
                                <option value="3">Lv. 3</option>
                                <option value="4">Lv. 4</option>
                                <option value="5">Lv. 5</option>
                            </select>
                            <select 
                                value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)}
                            >
                                <option value="">모듈(전체)</option>
                                <option value="A">A모듈</option>
                                <option value="B">B모듈</option>
                            </select>
                        </div>
                        <input 
                            type="text" 
                            placeholder="검색" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    
                    {isLoading ? (
                        <div className="loading-message">데이터를 불러오는 중...</div>
                    ) : (
                        <div className="table-area">
                            <table>
                                <thead>
                                    <tr>
                                        <th>난이도</th>
                                        <th>모듈</th>
                                        <th>폴더명</th>
                                        <th>부가설명</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item.idx}>
                                            <td>Lv. {item.level}</td>
                                            <td>{item.module}모듈</td>
                                            <td>{item.name}</td>
                                            <td>{item.description}</td>
                                            <td>
                                                <button 
                                                    onClick={() => handleDelete(item)}
                                                    className="delete-btn"
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            </div>
        </div>
    );
}

export default DeletePage;