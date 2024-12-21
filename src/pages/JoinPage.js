import React, { useState } from 'react';
import axios from 'axios';
import './styles/AuthStyle.css';
import { API_URL } from '../config/config';

function JoinPage() {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [githubId, setGithubId] = useState('');
    const [githubToken, setGithubToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [idChecked, setIdChecked] = useState(false);
    const [githubChecked, setGithubChecked] = useState(false);

    // 아이디 유효성 검사
    const validateId = (id) => {
        const idRegex = /^[a-zA-Z0-9]{4,20}$/;
        return idRegex.test(id);
    };

    // 비밀번호 유효성 검사 - 4자리 숫자만
    const validatePassword = (password) => {
        const passwordRegex = /^\d{4,}$/;
        return passwordRegex.test(password);
    };

    // GitHub 계정 확인
    const checkGithubAccount = async () => {
        if (!githubId || !githubToken) {
            setError('GitHub ID와 토큰을 모두 입력해주세요.');
            return;
        }
    
        try {
            const response = await axios.get(`${API_URL}/api/check-github/${githubId}`, {
                headers: {
                    'Authorization': `token ${githubToken}`
                }
            });
            if (response.data.valid) {
                setSuccess('유효한 GitHub 계정입니다.');
                setError('');
                setGithubChecked(true);
            }
        } catch (err) {
            console.error('GitHub 계정 확인 에러:', err);
            setError(err.response?.data?.error || '유효하지 않은 GitHub 계정입니다.');
            setGithubChecked(false);
        }
    };

    // 아이디 중복 확인
    const checkIdDuplicate = async () => {
        if (!id) {
            setError('아이디를 입력해주세요.');
            return;
        }

        if (!validateId(id)) {
            setError('아이디는 4-20자의 영문자와 숫자만 사용 가능합니다.');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/check-id`, { id });
            if (response.data.available) {
                setSuccess('사용 가능한 아이디입니다.');
                setError('');
                setIdChecked(true);
            } else {
                setError('이미 사용 중인 아이디입니다.');
                setIdChecked(false);
            }
        } catch (err) {
            setError('아이디 중복 확인에 실패했습니다.');
            setIdChecked(false);
        }
    };

    // ID 값이 변경되면 중복확인 상태 초기화
    const handleIdChange = (e) => {
        setId(e.target.value);
        setIdChecked(false);
        setError('');
        setSuccess('');
    };

    // GitHub ID 변경 시 확인 상태 초기화
    const handleGithubIdChange = (e) => {
        setGithubId(e.target.value);
        setGithubChecked(false);
        setError('');
        setSuccess('');
    };

    // GitHub Token 변경 시 확인 상태 초기화
    const handleGithubTokenChange = (e) => {
        setGithubToken(e.target.value);
        setGithubChecked(false);
        setError('');
        setSuccess('');
    };

    const handleJoin = async (e) => {
        e.preventDefault();

        if (!idChecked) {
            setError('아이디 중복 확인을 해주세요.');
            return;
        }

        if (!githubChecked) {
            setError('GitHub 계정 확인을 해주세요.');
            return;
        }

        if (!validatePassword(password)) {
            setError('비밀번호는 4자리 이상의 숫자만 입력 가능합니다.');
            return;
        }

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (name.length < 2) {
            setError('이름은 2자 이상이어야 합니다.');
            return;
        }

        if (!githubToken) {
            setError('GitHub 토큰을 입력해주세요.');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/register`, { 
                id, 
                pw: password, 
                name,
                githubId,
                githubToken
            });
            setSuccess('회원가입이 완료되었습니다!');
            setError('');
            // 회원가입 성공 후 로그인 페이지로 이동
            window.location.href = '/login';
        } catch (err) {
            setError('회원가입에 실패했습니다.');
        }
    };

    return (
        <div className='main-area'>
            <form onSubmit={handleJoin}>
                <h1>회원가입</h1>
                <div>
                    <label>ID: </label>
                    <div className='id-box'>
                        <input 
                            type="text" 
                            className='input-id' 
                            placeholder='아이디' 
                            value={id} 
                            onChange={handleIdChange} 
                            required 
                        />
                        <button 
                            type="button" 
                            onClick={checkIdDuplicate} 
                            className="check-button"
                        >
                            중복확인
                        </button>
                    </div>
                </div>
                <div>
                    <label>GitHub ID: </label>
                    <div className='id-box'>
                        <input 
                            type="text" 
                            className='input-id'
                            placeholder='깃허브 아이디' 
                            value={githubId} 
                            onChange={handleGithubIdChange}
                            required 
                        />
                        <button 
                            type="button" 
                            onClick={checkGithubAccount} 
                            className="check-button"
                        >
                            계정확인
                        </button>
                    </div>
                </div>
                <div>
                    <div className='input-group'>
                        <label>GitHub Token: </label>
                        <input 
                            type="text" 
                            className='input-token'
                            placeholder='깃허브 토큰' 
                            value={githubToken}
                            onChange={handleGithubTokenChange}
                            required 
                        />
                    </div>
                </div>
                <div>
                    <div className='input-group'>
                        <label>Name: </label>
                        <input 
                            type="text" 
                            className='input-name' 
                            placeholder='이름' 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>
                </div>
                <div className='inline-inputs'>
                    <div className='input-group'>
                        <label>Password: </label>
                        <input 
                            type="password" 
                            className='input-password'
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="4자리 이상 숫자"
                            required 
                        />
                    </div>
                    <div className='input-group'>
                        <label>Confirm Password: </label>
                        <input 
                            type="password" 
                            className='input-password'
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            placeholder="비밀번호 확인"
                            required 
                        />
                    </div>
                </div>
                <button type="submit" className='submit-btn'>Sign Up</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
}

export default JoinPage;