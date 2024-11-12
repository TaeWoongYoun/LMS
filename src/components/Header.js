// Header.js
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // 초기 로그인 상태 확인
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        // 로그인 상태 변경 이벤트 리스너
        const handleLoginChange = () => {
            const token = localStorage.getItem('token');
            setIsLoggedIn(!!token);
        };

        // 이벤트 리스너 등록
        window.addEventListener('loginChange', handleLoginChange);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('loginChange', handleLoginChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        // 로그아웃 이벤트 발생
        window.dispatchEvent(new Event('loginChange'));
        navigate('/');
    };

    return (
        <header>
            <div className='logo'>
                <h1><Link to="/">DBSWEB</Link></h1>
            </div>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/insert">Insert</Link></li>
                    <li><Link to="/welcome">Welcome</Link></li>
                    {!isLoggedIn ? (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/join">Join</Link></li>
                        </>
                    ) : (
                        <>
                            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;