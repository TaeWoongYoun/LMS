// Header.js
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        const handleLoginChange = () => {
            const token = localStorage.getItem('token');
            setIsLoggedIn(!!token);
        };

        window.addEventListener('loginChange', handleLoginChange);

        return () => {
            window.removeEventListener('loginChange', handleLoginChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
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
                    <li><Link to="/welcome">Welcome</Link></li>
                    {!isLoggedIn ? (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/join">Join</Link></li>
                        </>
                    ) : (
                        <>
                            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</li>
                            <li><Link to="/insert">Insert</Link></li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;