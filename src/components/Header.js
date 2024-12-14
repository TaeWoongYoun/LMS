import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
    const [loginStatus, setLoginStatus] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
    
        if (token) {
            if (userRole === 'admin') {
                setLoginStatus('admin');
            } else if (userRole === 'manager') {
                setLoginStatus('manager');
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
                } else if (userRole === 'manager') {
                    setLoginStatus('manager');
                } else {
                    setLoginStatus('user');
                }
            } else {
                setLoginStatus(null);
            }
        };
    
        window.addEventListener('loginChange', handleLoginChange);
        
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    
        return () => {
            window.removeEventListener('loginChange', handleLoginChange);
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        setLoginStatus(null);
        window.dispatchEvent(new Event('loginChange'));
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header>
            <div className='logo'>
                <h1><Link to="/">WLMS</Link></h1>
            </div>
            <div className="header-right">
                <nav className="main-nav">
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        {loginStatus === null ? (
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/join">Join</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/welcome">Welcome</Link></li>
                                <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</li>
                            </>
                        )}
                    </ul>
                </nav>
                {loginStatus && (
                    <div className="hamburger-menu">
                        <button 
                            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
                            onClick={toggleMenu}
                            aria-label="메뉴 열기"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                )}
            </div>

            {loginStatus && (
                <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
                    <button 
                        className="side-menu-close"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="메뉴 닫기"
                    >
                        ✕
                    </button>
                    <nav className="admin-nav">
                        <h2>메뉴</h2>
                        <ul>
                            <li><Link to="/rank" onClick={() => setIsMenuOpen(false)}>Rank</Link></li>
                            <li><Link to="/update" onClick={() => setIsMenuOpen(false)}>Update</Link></li>
                            {(loginStatus === 'manager' || loginStatus === 'admin') && (
                                <>
                                    <li><Link to="/insert" onClick={() => setIsMenuOpen(false)}>Insert</Link></li>
                                    <li><Link to="/delete" onClick={() => setIsMenuOpen(false)}>Delete</Link></li>
                                    <li><Link to="/check" onClick={() => setIsMenuOpen(false)}>Check</Link></li>
                                </>
                            )}
                            {loginStatus === 'admin' && (
                                <li><Link to="/user" onClick={() => setIsMenuOpen(false)}>User</Link></li>
                            )}
                        </ul>
                    </nav>
                </div>
            )}

            {isMenuOpen && (
                <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
            )}
        </header>
    );
}

export default Header;