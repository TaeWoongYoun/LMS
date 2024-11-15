import React, { useState, useEffect } from 'react';
import './styles/UserPage.css';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // 서버에서 받은 데이터를 그대로 사용
      console.log('Server response:', data);
      setUsers(data);
      setError(null);
    } catch (error) {
      console.error('사용자 데이터 로딩 실패:', error);
      setError('사용자 데이터를 불러오는데 실패했습니다.');
    }
  };

  const handleDelete = async (idx) => {
    if (window.confirm('정말 이 사용자를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/users/${idx}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('사용자가 삭제되었습니다.');
        fetchUsers();
      } catch (error) {
        console.error('사용자 삭제 실패:', error);
        alert('사용자 삭제에 실패했습니다.');
      }
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (user.role === newRole) return; // 같은 역할로 변경하려는 경우 무시

    try {
      const response = await fetch(`http://localhost:3001/api/users/${user.idx}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 성공적으로 업데이트된 후에 사용자 상태 업데이트
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.idx === user.idx ? { ...u, role: newRole } : u
        )
      );
      
      alert('권한이 변경되었습니다.');
    } catch (error) {
      console.error('권한 변경 실패:', error);
      alert('권한 변경에 실패했습니다.');
      // 에러 발생 시 원래 상태로 복구
      setUsers(prevUsers => [...prevUsers]);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'user': '일반회원',
      'manager': '담당자',
      'admin': '관리자'
    };
    return roleMap[role];
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-page">
      <h2>회원 목록</h2>
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
          {users.map((user) => (
            <tr key={user.idx}>
              <td>{user.idx}</td>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>
                <select
                  value={user.role || 'user'}
                  onChange={(e) => handleRoleChange(user, e.target.value)}
                  className="role-select"
                >
                  <option value="user">{getRoleDisplay('user')}</option>
                  <option value="manager">{getRoleDisplay('manager')}</option>
                </select>
              </td>
              <td>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(user.idx)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserPage;