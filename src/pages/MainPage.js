import iframeData from "../data/iframeData"
import Prism from 'prismjs';
import React, { useState, useEffect } from 'react';

function MainPage() {
    const [selected, setSelected] = useState(null);
    const [showCode, setShowCode] = useState(false);
    const [htmlCode, setHtmlCode] = useState('');
    const [cssCode, setCssCode] = useState('');
    const [jsCode, setJsCode] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedModule, setSelectedModule] = useState('');

    // 코드 에디터 효과
    useEffect(() => {
        if (showCode) {
        Prism.highlightAll();
    }
    }, [showCode]);

    // 과제 선택
    const handleSelect = async (data) => {
        setSelected(data);
        setShowCode(false);

        const htmlResponse = await fetch(data.path);
        const htmlText = await htmlResponse.text();
        setHtmlCode(htmlText);

        const cssPath = data.path.replace('index.html', 'style.css');
        const cssResponse = await fetch(cssPath);
        const cssText = await cssResponse.text();
        setCssCode(cssText);
    
        const jsPath = data.path.replace('index.html', 'index.js');
        const jsResponse = await fetch(jsPath);
        if (!jsResponse.ok) {
            setJsCode('');
            return;
        }

        const clonedResponse = jsResponse.clone();
        const text = await clonedResponse.text();
    
        if (text.includes('<!DOCTYPE html>')) {
            setJsCode('None');
        } else {
            setJsCode(text);
        }
    
        setShowModal(true);
    };

    // 코드 확인 모달
    const toggleCode = () => {
        setShowCode((prev) => !prev);
    };

    const toggleCodeWithPassword = () => {
        if (showCode) return;    
        const password = prompt("비밀번호를 입력하세요:");
        if (password === 'xodnd') {
            toggleCode();
        } else {
            alert("비밀번호를 다시 확인해주세요.");
        }
    };
    

    // 과제 모달
    const closeModal = () => {
        setShowModal(false);
    };

    // 데이터 필터링
    const filteredData = iframeData.filter(item => {
        const matchesSearch = item.name.includes(searchTerm);
        const matchesLevel = selectedLevel ? item.level === parseInt(selectedLevel) : true;
        const matchesModule = selectedModule ? item.module === selectedModule : true;

        return matchesSearch && matchesLevel && matchesModule;
    });

    return (
    <div className="main-page">
        <div className="content">
            {/* 난이도/모듈 선택 및 과제 검색 */}
            <div className='search-area'>
                <div>
                    <select onChange={(e) => setSelectedLevel(e.target.value)} defaultValue="">
                        <option value="">난이도(전체)</option>
                        <option value="0">Lv. 0</option>
                        <option value="1">Lv. 1</option>
                        <option value="2">Lv. 2</option>
                        <option value="3">Lv. 3</option>
                        <option value="4">Lv. 4</option>
                        <option value="5">Lv. 5</option>
                    </select>
                    <select onChange={(e) => setSelectedModule(e.target.value)} defaultValue="">
                        <option value="">모듈(전체)</option>
                        <option value="A">A모듈</option>
                        <option value="B">B모듈</option>
                    </select>
                </div>
                <input type="text" placeholder="검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
            {/* 난이도/모듈 선택 및 과제 검색 */}

            {/* 과제 테이블*/}
            <div className="table-area">
                <table>
                    <thead>
                        <tr>
                        <th>난이도</th>
                        <th>모듈</th>
                        <th>폴더명</th>
                        <th>부가설명</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => (
                        <tr key={index} onClick={() => handleSelect(item)}>
                            <td>Lv. {item.level}</td>
                            <td>{item.module}모듈</td>
                            <td>{item.name}</td>
                            <td>{item.description}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* 과제 테이블*/}
        </div>

        {/* 실행화면 확인 모달 */}
        {showModal && (
        <div className="modal-area">
            <div className="modal-content">
            <h1>{selected.name}</h1>
            <iframe src={selected.path} title={selected.title}></iframe>
            <button onClick={closeModal} className="modal-close">닫기</button>
            <button onClick={toggleCodeWithPassword} className="code-show-btn">코드 확인하기</button>

            {/* 코드 확인 모달 */}
            {showCode && (
                <div className="code-area">
                    <div className="code-box">
                        <h2>HTML 코드</h2>
                        <pre>
                            <code className="language-markup">{htmlCode}</code>
                        </pre>
                    </div>
                    <div className="code-box">
                        <h2>CSS 코드</h2>
                        <pre>
                        <code className="language-css">{cssCode}</code>
                    </pre>
                    </div>
                    <div className="code-box">
                        <h2>JavaScript 코드</h2>
                        <pre>
                        <code className="language-javascript">{jsCode}</code>
                    </pre>
                    </div>
                    <button onClick={toggleCode} className="code-hidden-btn">닫기</button>
                </div>
            )}
            {/* 코드 확인 모달 */}
            </div>
        </div>
        )}
    </div>
    );
}

export default MainPage;