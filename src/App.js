import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import InsertPage from './pages/InsertPage.js';
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import MainPage from './pages/MainPage.js';
import DeletePage from './pages/DeletePage.js';
import 'prismjs/themes/prism-tomorrow.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route path='/' element={<MainPage/>} />
          <Route path='/welcome' element={<WelcomePage />} />
          <Route path='/insert' element={<InsertPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/join' element={<JoinPage />} />
          <Route path='/data' element={<DeletePage />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  )
}

export default App;