import React, { useState } from 'react';
import axios from 'axios';
import './styles/AuthStyle.css';

function JoinPage() {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [githubId, setGithubId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [idChecked, setIdChecked] = useState(false);
    const [githubChecked, setGithubChecked] = useState(false);

    // 아이디 유효성 검사
    const validateId = (id) => {
        const idRegex = /^[a-zA-Z0-9]{4,20}$/;
        return idRegex.test(id);
    };

    // 비밀번호 유효성 검사
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return passwordRegex.test(password);
    };

    // GitHub 계정 확인
    const checkGithubAccount = async () => {
        if (!githubId) {
            setError('GitHub ID를 입력해주세요.');
            return;
        }

        try {
            const response = await axios.get(`https://api.github.com/users/${githubId}`);
            if (response.status === 200) {
                setSuccess('유효한 GitHub 계정입니다.');
                setError('');
                setGithubChecked(true);
            }
        } catch (err) {
            setError('유효하지 않은 GitHub 계정입니다.');
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
            const response = await axios.post('http://localhost:3001/api/check-id', { id });
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
            setError('비밀번호는 8자 이상이며, 영문자, 숫자, 특수문자를 포함해야 합니다.');
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

        try {
            const response = await axios.post('http://localhost:3001/api/register', { 
                id, 
                pw: password, 
                name,
                githubId 
            });
            setSuccess('회원가입이 완료되었습니다!');
            setError('');
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
                        <input type="text" className='input-id' value={id} onChange={handleIdChange} required />
                        <button type="button" onClick={checkIdDuplicate} className="check-button">중복확인</button>
                    </div>
                </div>
                <div>
                    <label>GitHub ID: </label>
                    <div className='id-box'>
                        <input 
                            type="text" 
                            className='input-id' 
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
                    <label>Name: </label>
                    <input type="text" className='input-name' value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Password: </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label>Confirm Password: </label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <button type="submit" className='submit-btn'>Sign Up</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
}

export default JoinPage;