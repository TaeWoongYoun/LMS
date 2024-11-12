import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
    const [loginStatus, setLoginStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');

        if (token) {
            if (userName === 'admin') {
                setLoginStatus('admin'); // admin으로 로그인
            } else {
                setLoginStatus('user'); // 일반 사용자로 로그인
            }
        } else {
            setLoginStatus(null); // 로그인하지 않음
        }

        const handleLoginChange = () => {
            const token = localStorage.getItem('token');
            const userName = localStorage.getItem('userName');

            if (token) {
                if (userName === 'admin') {
                    setLoginStatus('admin');
                } else {
                    setLoginStatus('user');
                }
            } else {
                setLoginStatus(null);
            }
        };

        window.addEventListener('loginChange', handleLoginChange);

        return () => {
            window.removeEventListener('loginChange', handleLoginChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setLoginStatus(null);
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

                    {loginStatus === null ? (
                        <>
                            <li><Link to="/welcome">Welcome</Link></li>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/join">Join</Link></li>
                        </>
                    ) : loginStatus === 'admin' ? (
                        <>
                            <li><Link to="/delete">Delete</Link></li> {/* admin 전용 메뉴 */}
                            <li><Link to="/user">User</Link></li> {/* admin 전용 메뉴 */}
                            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/welcome">Welcome</Link></li>
                            <li><Link to="/insert">Insert</Link></li>
                            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;