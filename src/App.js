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
    </div>
  );
}

export default App;