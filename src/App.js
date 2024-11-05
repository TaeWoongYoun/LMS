import React, { useState } from 'react';
import './App.css';
import iframeData from './data/iframeData';

function App() {
  const [selected, setSelected] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSelect = async (data) => {
    setSelected(data);
    setShowCode(false);

    try {
      const htmlResponse = await fetch(data.path);
      const htmlText = await htmlResponse.text();
      setHtmlCode(htmlText);

      const cssPath = data.path.replace('index.html', 'style.css');
      const cssResponse = await fetch(cssPath);
      const cssText = await cssResponse.text();
      setCssCode(cssText);

      const jsPath = data.path.replace('index.html', 'index.js');
      try {
        const jsResponse = await fetch(jsPath);
        if (!jsResponse.ok) {
          setJsCode('');
          return;
        }

        const clonedResponse = jsResponse.clone();
        const text = await clonedResponse.text();

        if (text.includes('<!DOCTYPE html>')) {
          setJsCode('');
        } else {
          setJsCode(text);
        }
      } catch {
        setJsCode('');
      }
    } catch {
      setJsCode('');
    }

    setShowModal(true);
  };

  const toggleCode = () => {
    setShowCode((prev) => !prev);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="App">
      <header>
        <div className='logo'>
          <h1>DBSWEB</h1>
        </div>
        <nav>
            <ul>
              <li>인사말</li>
              <li>로그인</li>
              <li>회원가입</li>
            </ul>
          </nav>
      </header>
      <div className="page1">
        <div className="table-area">
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
                  <td>Lv. {item.level}</td>
                  <td>{item.module}모듈</td>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-container">
          <div className="modal-content">
            <h1>{selected.name}</h1>
            <iframe src={selected.path} title={selected.title}></iframe>
            <button onClick={closeModal} className="modalClose">
              닫기
            </button>
            <div className="page3">
              <button onClick={toggleCode} className="codeShowBtn">
                코드 확인하기
              </button>

              {showCode && (
                <div className="code-container">
                  <div className="code-box">
                    <h2>HTML 코드</h2>
                    <pre>{htmlCode}</pre>
                  </div>
                  <div className="code-box">
                    <h2>CSS 코드</h2>
                    <pre>{cssCode}</pre>
                  </div>
                  <div className="code-box">
                    <h2>JS 코드</h2>
                    <pre>{jsCode}</pre>
                  </div>
                  <button onClick={toggleCode} className="codeHiddenBtn">
                    닫기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;