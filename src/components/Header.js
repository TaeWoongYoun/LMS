import { Link } from 'react-router-dom';

function Header() {
    return (
        <header>
            <div className='logo'>
                <h1><Link to="/">DBSWEB</Link></h1>
            </div>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/welcome">Welcome</Link></li>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/join">Join</Link></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;