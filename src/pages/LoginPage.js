import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/AuthStyle.css';
import { API_URL } from '../config/config';

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
            const response = await axios.post(`${API_URL}/api/login`, { 
                id, 
                pw: password 
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && response.data.token) {
                setSuccess('로그인 성공');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.id);  // id 저장
                localStorage.setItem('userName', response.data.name);  // 화면 표시용으로 name도 유지
                localStorage.setItem('userRole', response.data.role);
                
                // axios 기본 헤더 설정
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                // 로그인 상태 변경 이벤트 발생
                window.dispatchEvent(new Event('loginChange'));

                // 짧은 지연 후 메인 페이지로 이동
                setTimeout(() => {
                    navigate('/');
                }, 500);
            } else {
                setError('로그인 응답이 올바르지 않습니다.');
            }
        } catch (err) {
            console.error('로그인 에러:', err);
            if (err.response?.status === 401) {
                setError('아이디 또는 비밀번호가 잘못되었습니다.');
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('로그인 중 오류가 발생했습니다.');
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLogin(e);
        }
    };

    return (
        <div className='main-area'>
            <form onSubmit={handleLogin}>
                <h1>로그인</h1>
                <div className="form-group">
                    <label>ID: </label>
                    <input 
                        type="text" 
                        className='input-name' 
                        value={id} 
                        onChange={(e) => setId(e.target.value)} 
                        onKeyPress={handleKeyPress}
                        placeholder="아이디를 입력하세요"
                        autoComplete="username"
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Password: </label>
                    <input 
                        type="password" 
                        className='input-password'
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="비밀번호를 입력하세요"
                        autoComplete="current-password"
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    className='submit-btn'
                    disabled={!id || !password}
                >
                    로그인
                </button>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </form>
        </div>
    );
}

export default LoginPage;