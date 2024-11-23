import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/UserPage.css';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        setUserRole(storedRole || '');
        
        const handleLoginChange = () => {
            const storedRole = localStorage.getItem('userRole');
            setUserRole(storedRole || '');
        };
        
        window.addEventListener('loginChange', handleLoginChange);
        fetchUsers();
        
        return () => {
            window.removeEventListener('loginChange', handleLoginChange);
        };
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/users');
            if (!response.ok) {
                throw new Error('사용자 데이터 로딩에 실패했습니다.');
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (idx, newRole) => {
        try {
            const response = await fetch(`http://localhost:3001/api/users/${idx}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                throw new Error('권한 변경에 실패했습니다.');
            }

            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.idx === idx ? { ...user, role: newRole } : user
                )
            );
            alert('권한이 변경되었습니다.');
        } catch (error) {
            alert('권한 변경에 실패했습니다.');
        }
    };

    const handleDelete = async (idx) => {
        if (!window.confirm('정말 이 사용자를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/users/${idx}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('사용자 삭제에 실패했습니다.');
            }

            setUsers(prevUsers => prevUsers.filter(user => user.idx !== idx));
            alert('사용자가 삭제되었습니다.');
        } catch (error) {
            alert('사용자 삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="user-area">
            {userRole === 'admin' ? (
                <>
                    <h1>회원 목록</h1>
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>아이디</th>
                                <th>이름</th>
                                <th>권한</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.idx}>
                                    <td>{user.idx}</td>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>
                                        <select 
                                            key={`role-${user.idx}`} 
                                            value={user.role || 'user'} 
                                            onChange={e => handleRoleChange(user.idx, e.target.value)} 
                                            className="role-select"
                                        >
                                            <option value="user">일반회원</option>
                                            <option value="manager">담당자</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(user.idx)} className="delete-button">회원 퇴출</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <div className="access-denied">
                    <h2>접근 권한이 없습니다</h2>
                    <p>이 페이지는 관리자만 접근할 수 있습니다.</p>
                    <Link to="/">메인 페이지로 돌아가기</Link>
                </div>
            )}
        </div>
    );
};

export default UserPage;