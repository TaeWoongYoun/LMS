import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
    const [loginStatus, setLoginStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (token) {
            if (userRole === 'admin') {
                setLoginStatus('admin');
            } else {
                setLoginStatus('user');
            }
        } else {
            setLoginStatus(null);
        }

        const handleLoginChange = () => {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');

            if (token) {
                if (userRole === 'admin') {
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
        localStorage.removeItem('userRole');
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
                            <li><Link to="/delete">Delete</Link></li>
                            <li><Link to="/user">User</Link></li>
                            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</li>
                        </>
                    ) : loginStatus === 'manager' ? (
                        <>
                            <li><Link to="/welcome">Welcome</Link></li>
                            <li><Link to="/insert">Insert</Link></li>
                            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/welcome">Welcome</Link></li>
                            <li><Link to="/submit">Submit</Link></li>
                            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;