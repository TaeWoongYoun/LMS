import React, { useState } from 'react';
import axios from 'axios';
import './styles/AuthStyle.css';

function JoinPage() {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleJoin = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/register', { id, pw: password, name });
            console.log(response);
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
                    <input 
                        type="text" 
                        value={id} 
                        onChange={(e) => setId(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Name: </label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
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
                <div>
                    <label>Confirm Password: </label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Sign Up</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
}

export default JoinPage;
