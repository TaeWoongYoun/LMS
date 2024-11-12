import iframeData from "../data/iframeData"
import Prism from 'prismjs';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
    const [userName, setUserName] = useState(''); 

    // 코드 하이라이팅 효과
    useEffect(() => {
        if (showCode) {
            Prism.highlightAll();
        }
    }, [showCode]);

    // 과제 선택 시 처리
    const handleSelect = async (data) => {
        setSelected(data); // 선택된 과제 설정
        setShowCode(false); // 코드 보기 상태 초기화

        // HTML 파일 불러오기
        const htmlResponse = await fetch(data.path);
        const htmlText = await htmlResponse.text();
        setHtmlCode(htmlText);

        // CSS 파일 불러오기
        const cssPath = data.path.replace('index.html', 'style.css');
        const cssResponse = await fetch(cssPath);
        const cssText = await cssResponse.text();
        setCssCode(cssText);
    
        // JavaScript 파일 불러오기
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
    
        setShowModal(true); // 모달 표시
    };

    // 코드 보기 토글
    const toggleCode = () => {
        setShowCode((prev) => !prev);
    };

    // 비밀번호 확인 후 코드 보기
    const toggleCodeWithPassword = () => {
        if (showCode) return;
        const password = prompt("비밀번호를 입력하세요:");
        if (password === null) {
            return;
        }
        if (password === 'xodnd') {
            toggleCode();
        } else {
            alert("비밀번호를 다시 확인해주세요.");
        }
    };
    
    // 모달 닫기
    const closeModal = () => {
        setShowModal(false);
    };

    // 데이터 필터링 (검색어, 난이도, 모듈에 맞춰 필터링)
    const filteredData = iframeData.filter(item => {
        const matchesSearch = item.name.includes(searchTerm);
        const matchesLevel = selectedLevel ? item.level === parseInt(selectedLevel) : true;
        const matchesModule = selectedModule ? item.module === selectedModule : true;

        return matchesSearch && matchesLevel && matchesModule;
    });

    // 사용자 이름 로드 및 로그인 상태 변경 처리
    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        setUserName(storedName || '');
        const handleLoginChange = () => {
            const storedName = localStorage.getItem('userName');
            setUserName(storedName || '');
        };
        window.addEventListener('loginChange', handleLoginChange);
        return () => {
            window.removeEventListener('loginChange', handleLoginChange);
        };
    }, []);

    return (
        <div className="main-page">
            <div className="content">
                <h1>{userName ? `${userName}님 환영합니다` : ''}</h1>
                {userName ? (
                    <>
                        {/* 난이도 및 모듈 선택, 과제 검색 */}
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
                            <input 
                                type="text" 
                                placeholder="검색" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* 과제 테이블 */}
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
                                </div>
                            </div>
                        )}
                    </>
                ) : <div className="login-message">
                        <p><Link to="/login">주요 기능을 확인하려면 로그인이 필요합니다</Link></p>
                    </div>
                }
            </div>
        </div>
    );
}

export default MainPage;