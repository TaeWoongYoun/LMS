import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/AuthStyle.css';

function LoginPage() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
    
        try {
            const response = await axios.post('http://localhost:3001/api/login', { 
                id, 
                pw: password 
            });
            
            setSuccess('로그인 성공');
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userName', response.data.name);
            
            // 로그인 상태 변경 이벤트 발생
            window.dispatchEvent(new Event('loginChange'));
            
            navigate('/');
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            setError(err.response?.data?.error || '로그인에 실패했습니다.');
        }
    };

    return (
        <div className='main-area'>
            <form onSubmit={handleLogin}>
                <h1>로그인</h1>
                <div>
                    <label>ID: </label>
                    <input 
                        type="text" 
                        value={id} 
                        onChange={(e) => setId(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
}

export default LoginPage;