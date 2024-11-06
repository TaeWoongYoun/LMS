import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import MainPage from './pages/MainPage.js';
import 'prismjs/themes/prism-tomorrow.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route path='/' element={<MainPage/>} />
          <Route path='/welcome' element={<WelcomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/join' element={<JoinPage />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  )
}

export default App;