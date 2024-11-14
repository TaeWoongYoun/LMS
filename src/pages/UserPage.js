import React, { useState, useEffect } from 'react';
import './styles/UserPage.css'

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',},
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

    fetchUsers();
  }, []);

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
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.idx}>
              <td>{user.idx}</td>
              <td>{user.id}</td>
              <td>{user.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserPage;