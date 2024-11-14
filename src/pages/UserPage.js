import React, { useState, useEffect } from 'react';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchUsers();
  }, []);

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>회원 목록</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f4f4f4' }}>번호</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f4f4f4' }}>아이디</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f4f4f4' }}>이름</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.idx}>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{user.idx}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{user.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{user.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserPage;