import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Simple Homepage</h1>
        <p>This is a simple React homepage example.</p>
        <button onClick={() => alert("Hello, welcome to my site!")}>
          Click me!
        </button>
      </header>
      <section className="about-section">
        <h2>About Us</h2>
        <p>We are a team dedicated to creating awesome web experiences.</p>
      </section>
      <div className='iframe-area'>
            <h1>슬라이드</h1>
            <iframe
                src="/Amodule/slide/index.html"
                style={{
                    width: '1000px',
                    height: '300px',
                    border: 'none',
                    margin: '0 auto',
                }}
            ></iframe>
        </div>
    </div>
  );
}

export default App;