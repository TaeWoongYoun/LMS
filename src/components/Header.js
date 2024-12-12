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
        
        // 메뉴가 열려있을 때 스크롤 방지
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
                <h1><Link to="/">W-LMS</Link></h1>
            </div>
            <div className="header-right">
                <nav className="main-nav">
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        {loginStatus === null ? (
                            <>
                                <li><Link to="/welcome">Welcome</Link></li>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/join">Join</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/welcome">Welcome</Link></li>
                                <li><Link to="/rank">Rank</Link></li>
                                <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</li>
                            </>
                        )}
                    </ul>
                </nav>
                {(loginStatus === 'admin' || loginStatus === 'manager') && (
                    <div className="hamburger-menu">
                        <button 
                            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
                            onClick={toggleMenu}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                )}
            </div>

            {/* 사이드 메뉴 */}
            {(loginStatus === 'admin' || loginStatus === 'manager') && (
                <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
                    <button 
                        className="side-menu-close"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        ✕
                    </button>
                    <nav className="admin-nav">
                        <h2>관리자 메뉴</h2>
                        <ul>
                            <li><Link to="/insert" onClick={() => setIsMenuOpen(false)}>콘텐츠 등록</Link></li>
                            <li><Link to="/delete" onClick={() => setIsMenuOpen(false)}>콘텐츠 삭제</Link></li>
                            <li><Link to="/check" onClick={() => setIsMenuOpen(false)}>과제 확인</Link></li>
                            {loginStatus === 'admin' && (
                                <li><Link to="/user" onClick={() => setIsMenuOpen(false)}>회원 관리</Link></li>
                            )}
                        </ul>
                    </nav>
                </div>
            )}

            {/* 오버레이 */}
            {isMenuOpen && (
                <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
            )}
        </header>
    );
}

export default Header;