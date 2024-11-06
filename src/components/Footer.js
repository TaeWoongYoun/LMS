import { Link } from 'react-router-dom';
import github from '../assets/github.png'
import insta from '../assets/insta.png'

function Footer() {
    return (
        <footer>
            <div className='logo'>
                <h1><Link to="/">DBSWEB</Link></h1>
            </div>
            <address>© 2024 TaeWoongYoun. All rights reserved.</address>
            <div className='sns'>
                <a href='https://github.com/TaeWoongYoun/react-start' target="_blank" rel="noopener noreferrer">
                    <img src={github} alt='깃허브 이미지' className='github'></img>
                </a>
                <a href='https://www.instagram.com/xo._.dnd/' target="_blank" rel="noopener noreferrer">
                    <img src={insta} alt='인스타그램 이미지' className='insta'></img>
                </a>
            </div>
        </footer>
    );
}

export default Footer;