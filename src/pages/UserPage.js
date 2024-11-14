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
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
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
        fetchUsers(); // 사용자 목록 새로고침
      } catch (error) {
        console.error('사용자 삭제 실패:', error);
        alert('사용자 삭제에 실패했습니다.');
      }
    }
  };

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  }

  return (
    <div className='user-area'>
      <h1>회원 목록</h1>
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>아이디</th>
            <th>이름</th>
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
                <button onClick={() => handleDelete(user.idx)}>버튼</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserPage;