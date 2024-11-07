import React, { useState } from 'react';
import axios from 'axios';

function WelcomePage() {
    const [module, setModule] = useState('');
    const [level, setLevel] = useState('');
    const [html, setHtml] = useState('');
    const [css, setCss] = useState('');
    const [js, setJs] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:3001/insert', {
                module,
                level,
                html,
                css,
                js
            });
            alert(response.data);
        } catch (error) {
            console.error('Error inserting data:', error);
            alert('Failed to insert data');
        }
    };

    return (
        <div>
            <h1>Welcome Page</h1>
            <p>Welcome to the home page!</p>

            <select onChange={(e) => setModule(e.target.value)}>
                <option value="">Select Module</option>
                <option value="A">A 모듈</option>
                <option value="B">B 모듈</option>
            </select>

            <select onChange={(e) => setLevel(e.target.value)}>
                <option value="">Select Level</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
            </select>

            <textarea placeholder="HTML Code" onChange={(e) => setHtml(e.target.value)}></textarea>
            <textarea placeholder="CSS Code" onChange={(e) => setCss(e.target.value)}></textarea>
            <textarea placeholder="JS Code" onChange={(e) => setJs(e.target.value)}></textarea>

            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default WelcomePage;
