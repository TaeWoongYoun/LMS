import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/UpdatePage.css';
import { Navigate } from 'react-router-dom';

const UpdatePage = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [userInfo, setUserInfo] = useState({
        name: '',
        githubId: '',
        githubToken: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [infoMessage, setInfoMessage] = useState({ error: '', success: '' });
    const [passwordMessage, setPasswordMessage] = useState({ error: '', success: '' });
    const [githubChecked, setGithubChecked] = useState(false);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/user/${userId}`);
                const { name, github_id, github_token } = response.data;
                setUserInfo(prev => ({
                    ...prev,
                    name,
                    githubId: github_id || '',
                    githubToken: github_token || ''
                }));
                setGithubChecked(true);
            } catch (err) {
                setInfoMessage({ error: '사용자 정보를 불러오는데 실패했습니다.', success: '' });
            }
        };

        if (userId) {
            fetchUserInfo();
        }
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'githubId' || name === 'githubToken') {
            setGithubChecked(false);
        }
        if (['currentPassword', 'newPassword', 'confirmNewPassword'].includes(name)) {
            setPasswordMessage({ error: '', success: '' });
        } else {
            setInfoMessage({ error: '', success: '' });
        }
    };

    const checkGithubAccount = async () => {
        if (!userInfo.githubId || !userInfo.githubToken) {
            setInfoMessage({ error: 'GitHub ID와 토큰을 모두 입력해주세요.', success: '' });
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3001/api/check-github/${userInfo.githubId}`, {
                headers: {
                    'Authorization': `Bearer ${userInfo.githubToken}`
                }
            });
            if (response.data.valid) {
                setInfoMessage({ error: '', success: '유효한 GitHub 계정입니다.' });
                setGithubChecked(true);
            }
        } catch (err) {
            setInfoMessage({
                error: err.response?.data?.error || '유효하지 않은 GitHub 계정입니다.',
                success: ''
            });
            setGithubChecked(false);
        }
    };

    const validatePassword = (password) => {
        const passwordRegex = /^\d{4,}$/;
        return passwordRegex.test(password);
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setInfoMessage({ error: '', success: '' });

        if (!githubChecked) {
            setInfoMessage({ error: 'GitHub 계정 확인을 해주세요.', success: '' });
            return;
        }

        try {
            await axios.put(`http://localhost:3001/api/user/${userId}`, {
                name: userInfo.name,
                githubId: userInfo.githubId,
                githubToken: userInfo.githubToken
            });

            setInfoMessage({ error: '', success: '사용자 정보가 성공적으로 업데이트되었습니다.' });
        } catch (err) {
            setInfoMessage({
                error: err.response?.data?.error || '사용자 정보 업데이트에 실패했습니다.',
                success: ''
            });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage({ error: '', success: '' });

        if (!userInfo.currentPassword) {
            setPasswordMessage({ error: '현재 비밀번호를 입력해주세요.', success: '' });
            return;
        }
        if (!validatePassword(userInfo.newPassword)) {
            setPasswordMessage({ error: '새 비밀번호는 4자리 이상의 숫자여야 합니다.', success: '' });
            return;
        }
        if (userInfo.newPassword !== userInfo.confirmNewPassword) {
            setPasswordMessage({ error: '새 비밀번호가 일치하지 않습니다.', success: '' });
            return;
        }

        try {
            await axios.put(`http://localhost:3001/api/user/${userId}/password`, {
                currentPassword: userInfo.currentPassword,
                newPassword: userInfo.newPassword
            });

            setPasswordMessage({ error: '', success: '비밀번호가 성공적으로 변경되었습니다.' });
            setUserInfo(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }));
        } catch (err) {
            setPasswordMessage({
                error: err.response?.data?.error || '비밀번호 변경에 실패했습니다.',
                success: ''
            });
        }
    };

    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/" />;
    }

    return (
        <div className="update-area">
            <div className="tab-container">
                <button 
                    className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    기본 정보
                </button>
                <button 
                    className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                >
                    비밀번호 변경
                </button>
            </div>

            {activeTab === 'info' ? (
                <form onSubmit={handleInfoSubmit} className="update-form">
                    <h1>기본 정보 수정</h1>
                    
                    <div className="form-group">
                        <label>이름:</label>
                        <input
                            type="text"
                            name="name"
                            value={userInfo.name}
                            onChange={handleChange}
                            required
                            minLength={2}
                        />
                    </div>

                    <div className="form-group">
                        <label>GitHub ID:</label>
                        <div className="input-with-button">
                            <input
                                type="text"
                                name="githubId"
                                value={userInfo.githubId}
                                onChange={handleChange}
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

                    <div className="form-group">
                        <label>GitHub Token:</label>
                        <input
                            type="text"
                            name="githubToken"
                            value={userInfo.githubToken}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="update-btn">정보 수정</button>
                    {infoMessage.error && <p className="error-message">{infoMessage.error}</p>}
                    {infoMessage.success && <p className="success-message">{infoMessage.success}</p>}
                </form>
            ) : (
                <form onSubmit={handlePasswordSubmit} className="update-form">
                    <h1>비밀번호 변경</h1>
                    
                    <div className="form-group">
                        <label>현재 비밀번호:</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={userInfo.currentPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>새 비밀번호:</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={userInfo.newPassword}
                            onChange={handleChange}
                            placeholder="4자리 이상 숫자"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>새 비밀번호 확인:</label>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            value={userInfo.confirmNewPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="update-btn">비밀번호 변경</button>
                    {passwordMessage.error && <p className="error-message">{passwordMessage.error}</p>}
                    {passwordMessage.success && <p className="success-message">{passwordMessage.success}</p>}
                </form>
            )}
        </div>
    );
};

export default UpdatePage;