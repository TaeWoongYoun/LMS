import React, { useState } from 'react';
import './App.css';
import iframeData from './data/iframeData';

function App() {
    const [selected, setSelected] = useState(null);
    const [showCode, setShowCode] = useState(false);
    const [htmlCode, setHtmlCode] = useState('');

    const handleSelect = async (data) => {
        setSelected(data);
        setShowCode(false);

        try {
            const response = await fetch(data.path);
            const text = await response.text();
            setHtmlCode(text);
        } catch (error) {
            console.error("Failed to fetch HTML code:", error);
        }
    };

    const toggleCode = () => {
        setShowCode((prev) => !prev);
    };

    return (
        <div className="App">
            <h1>모듈 목록</h1>
            <div className='table-area'>
                <table className="module-table">
                    <thead>
                        <tr>
                            <th>난이도</th>
                            <th>모듈</th>
                            <th>폴더명</th>
                            <th>부가설명</th>
                        </tr>
                    </thead>
                    <tbody>
                        {iframeData.map((item, index) => (
                            <tr key={index} onClick={() => handleSelect(item)} className="table-row">
                                <td>{item.level}</td>
                                <td>{item.module}모듈</td>
                                <td>{item.name}</td>
                                <td>{item.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div className='iframe-area'>
                    <h1>{selected.name}</h1>
                    <iframe
                        src={selected.path}
                        title={selected.title}
                    ></iframe>
                </div>
            )}

            <button onClick={toggleCode}>
                코드 확인하기
            </button>

            {showCode && htmlCode && (
                <div className="code-container">
                    <div className="code-box">
                        <h2>HTML 코드</h2>
                        <pre>{htmlCode}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;