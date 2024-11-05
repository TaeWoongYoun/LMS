import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WelcomePage from '../pages/WelcomePage';
import LoginPage from '../pages/LoginPage';
import JoinPage from '../pages/JoinPage';

function Header() {
    return (
        <Router>
            {/* 헤더 영역*/}
            <header>
                <div className='logo'>
                    <h1><Link to="/">DBSWEB</Link></h1>
                </div>
                <nav>
                    <ul>
                        <li><Link to="/welcome">Welcome</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/join">Join</Link></li>
                    </ul>
                </nav>
            </header>
            {/* 헤더 영역*/}

            {/* router */}
            <Routes>
                <Route path='/welcome' element={<WelcomePage/>} />
                <Route path='/login' element={<LoginPage/>} />
                <Route path='/join' element={<JoinPage/>} />
            </Routes>
            {/* router */}
        </Router>
    );
}

export default Header;