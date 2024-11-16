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
    const [completedAssignments, setCompletedAssignments] = useState([]);
    const [submittedAssignments, setSubmittedAssignments] = useState([]);
    
    // 과제 제출 관련 상태
    const [submissionData, setSubmissionData] = useState(null);
    const [description, setDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    useEffect(() => {
        if (showCode) {
            Prism.highlightAll();
        }
    }, [showCode]);

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        setUserName(storedName || '');

        if (storedName) {
            fetchCompletedAssignments(storedName);
            fetchSubmittedAssignments(storedName);
        }

        const handleLoginChange = () => {
            const updatedName = localStorage.getItem('userName');
            setUserName(updatedName || '');
            if (updatedName) {
                fetchCompletedAssignments(updatedName);
                fetchSubmittedAssignments(updatedName);
            }
        };

        window.addEventListener('loginChange', handleLoginChange);
        return () => {
            window.removeEventListener('loginChange', handleLoginChange);
        };
    }, []);

    const fetchCompletedAssignments = async (userName) => {
        try {
            const response = await fetch(`http://localhost:3001/api/completed-assignments/${userName}`);
            const data = await response.json();
            setCompletedAssignments(data.map(item => item.assignment_name));
        } catch (error) {
            console.error('완료된 과제 조회 실패:', error);
        }
    };

    const fetchSubmittedAssignments = async (userName) => {
        try {
            const response = await fetch(`http://localhost:3001/api/submissions/user/${userName}`);
            const data = await response.json();
            setSubmittedAssignments(data.map(item => item.assignment_name));
        } catch (error) {
            console.error('제출된 과제 조회 실패:', error);
        }
    };

    // 이미지 선택 처리
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                setError('파일 크기는 5MB를 초과할 수 없습니다.');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                setError('이미지 파일만 업로드 가능합니다.');
                return;
            }

            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    // 과제 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedImage) {
            setError('이미지를 선택해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('userName', userName);
        formData.append('description', description);
        formData.append('assignmentName', submissionData.name);
        formData.append('assignmentPath', submissionData.path);

        try {
            const response = await fetch('http://localhost:3001/api/submit', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setSuccess('과제가 성공적으로 제출되었습니다!');
            // 제출 성공 시 제출된 과제 목록 업데이트
            setSubmittedAssignments([...submittedAssignments, submissionData.name]);
            
            setTimeout(() => {
                resetSubmissionForm();
            }, 2000);
            
        } catch (error) {
            setError(error.message || '과제 제출 중 오류가 발생했습니다.');
        }
    };

    // 제출 폼 초기화
    const resetSubmissionForm = () => {
        setDescription('');
        setSelectedImage(null);
        setPreviewUrl('');
        setError('');
        setSuccess('');
        setSubmissionData(null);
    };

    // 과제 미리보기
    const handlePreview = async (data, e) => {
        e.stopPropagation();
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
            const jsResponse = await fetch(jsPath);
            
            if (!jsResponse.ok) {
                setJsCode('');
            } else {
                const text = await jsResponse.text();
                setJsCode(text.includes('<!DOCTYPE html>') ? 'None' : text);
            }
        
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching files:', error);
            alert('파일을 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 과제 제출 모달 열기
    const handleSubmitClick = (data, e) => {
        e.stopPropagation();
        if (completedAssignments.includes(data.name)) {
            alert('이미 완료된 과제입니다.');
            return;
        }
        if (submittedAssignments.includes(data.name)) {
            alert('이미 제출된 과제입니다. 검토중입니다.');
            return;
        }
        setError('');
        setSuccess('');
        setSubmissionData({
            name: data.name,
            path: data.path
        });
    };

    const toggleCode = () => {
        setShowCode((prev) => !prev);
    };

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
    
    const closeModal = () => {
        setShowModal(false);
        setShowCode(false);
        setSelected(null);
    };

    // 데이터 필터링
    const filteredData = iframeData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = selectedLevel ? item.level === parseInt(selectedLevel) : true;
        const matchesModule = selectedModule ? item.module === selectedModule : true;
        return matchesSearch && matchesLevel && matchesModule;
    });

    return (
        <div className="main-page">
            <div className="content">
                <h1>{userName ? `${userName}님 환영합니다` : ''}</h1>
                {userName ? (
                    <>
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

                        <div className="table-area">
                            <table>
                                <thead>
                                    <tr>
                                        <th>상태</th>
                                        <th>난이도</th>
                                        <th>모듈</th>
                                        <th>폴더명</th>
                                        <th>부가설명</th>
                                        <th>작업</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="status-cell">
                                                {completedAssignments.includes(item.name) ? (
                                                    <span className="status-icon completed" title="완료">✅</span>
                                                ) : submittedAssignments.includes(item.name) ? (
                                                    <span className="status-icon pending" title="검토중">⏳</span>
                                                ) : (
                                                    <span className="status-icon not-submitted" title="미제출">➖</span>
                                                )}
                                            </td>
                                            <td>Lv. {item.level}</td>
                                            <td>{item.module}모듈</td>
                                            <td>{item.name}</td>
                                            <td>{item.description}</td>
                                            <td>
                                                <button 
                                                    className="preview-btn"
                                                    onClick={(e) => handlePreview(item, e)}
                                                >
                                                    미리보기
                                                </button>
                                                {!completedAssignments.includes(item.name) && 
                                                    !submittedAssignments.includes(item.name) && (
                                                    <button 
                                                        className="submit-btn"
                                                        onClick={(e) => handleSubmitClick(item, e)}
                                                    >
                                                        과제 제출
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 과제 확인 모달 */}
                        {showModal && (
                            <div className="modal-area">
                                <div className="modal-content">
                                    <h1>{selected.name}</h1>
                                    <iframe src={selected.path} title={selected.title}></iframe>
                                    <button onClick={closeModal} className="modal-close">닫기</button>
                                    <button onClick={toggleCodeWithPassword} className="code-show-btn">코드 확인하기</button>

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

                        {/* 과제 제출 모달 */}
                        {submissionData && (
                            <div className="modal-area">
                                <div className="modal-content submit-modal">
                                    <h1>{submissionData.name} 과제 제출</h1>
                                    {error && <div className="error-message">{error}</div>}
                                    {success && <div className="success-message">{success}</div>}
                                    
                                    <form onSubmit={handleSubmit} className="submit-form">
                                        <div className="form-group">
                                            <label>과제명:</label>
                                            <input
                                                type="text"
                                                value={submissionData.name}
                                                disabled
                                                className="disabled-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>설명:</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="설명을 입력하세요"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>이미지:</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                required
                                            />
                                            {previewUrl && (
                                                <button 
                                                    type="button" 
                                                    className="preview-button"
                                                    onClick={() => setShowPreviewModal(true)}
                                                >
                                                이미지 미리보기
                                                </button>
                                            )}
                                        </div>

                                        <div className="button-group">
                                            <button type="submit" className="submit-button">
                                                제출하기
                                            </button>
                                            <button 
                                                type="button" 
                                                className="cancel-button"
                                                onClick={resetSubmissionForm}
                                            >
                                                닫기
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* 이미지 미리보기 모달 */}
                        {showPreviewModal && (
                            <div 
                                className="modal-backdrop" 
                                onClick={() => setShowPreviewModal(false)}
                            >
                                <div 
                                    className="modal-content" 
                                    onClick={e => e.stopPropagation()}
                                >
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        className="modal-image"
                                    />
                                    <button 
                                        className="modal-close-button"
                                        onClick={() => setShowPreviewModal(false)}
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="login-message">
                        <p><Link to="/login">주요 기능을 확인하려면 로그인이 필요합니다</Link></p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MainPage;