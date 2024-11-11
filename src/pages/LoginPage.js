import React, { useState } from 'react';
import axios from 'axios';
import './styles/AuthStyle.css'

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('http://localhost:3001/api/login', { 
                email, 
                password 
            });
            
            setSuccess('로그인 성공');
            localStorage.setItem('token', response.data.token);
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            setError(err.response?.data || '로그인에 실패했습니다.');
        }
    };

    return (
        <div className='main-area'>
            <form onSubmit={handleLogin}>
                <h1>로그인</h1>
                <div>
                    <label>Email: </label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
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