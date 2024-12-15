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
import UserPage from './pages/UserPage.js';
import CheckPage from './pages/CheckPage.js';
import RankPage from './pages/RankPage.js';
import UpdatePage from './pages/UpdatePage.js';
import BoardPage from './pages/BoardPage.js';
import WritePostPage from './pages/WritePostPage.js';
import PostDetailPage from './pages/PostDetailPage.js';
import PostEditPage from './pages/PostEditPage.js';
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
          <Route path='/delete' element={<DeletePage />} />
          <Route path='/user' element={<UserPage />} />
          <Route path='/check' element={<CheckPage />} />
          <Route path='/rank' element={<RankPage />} />
          <Route path='/update' element={<UpdatePage />} />
          <Route path='/board' element={<BoardPage />} />
          <Route path='/writepost' element={<WritePostPage />} />
          <Route path='/postdetail/:id' element={<PostDetailPage />} />
          <Route path='/postedit/:id' element={<PostEditPage />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  )
}

export default App;