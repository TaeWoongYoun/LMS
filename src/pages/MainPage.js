import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Prism from 'prismjs';

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
    const [moduleData, setModuleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // 과제 제출 관련 상태
    const [submissionData, setSubmissionData] = useState(null);
    const [description, setDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // 초기 데이터 로드
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const storedName = localStorage.getItem('userName');
                setUserName(storedName || '');
    
                if (storedName) {
                    await Promise.all([
                        fetchCompletedAssignments(storedName),
                        fetchSubmittedAssignments(storedName)
                    ]);
                }
    
                await fetchModuleData();
                setLoading(false);
            } catch (err) {
                setError('데이터 로딩 중 오류가 발생했습니다.');
                console.error('Data loading error:', err);
                setLoading(false);
            }
        };
    
        fetchInitialData();
    }, []);
    
    // 검색과 필터링을 위한 useEffect
    useEffect(() => {
        const fetchFilteredData = async () => {
            if (!searchTerm && !selectedLevel && !selectedModule) {
                // 필터링 조건이 없으면 전체 데이터 로드
                fetchModuleData();
                return;
            }
    
            try {
                const queryParams = new URLSearchParams();
                if (selectedLevel) queryParams.append('level', selectedLevel);
                if (selectedModule) queryParams.append('module', selectedModule);
                if (searchTerm) queryParams.append('search', searchTerm);
    
                const response = await fetch(`http://localhost:3001/api/modules/filter?${queryParams}`);
                if (!response.ok) throw new Error('모듈 데이터 조회 실패');
    
                const data = await response.json();
                setModuleData(data);
            } catch (err) {
                console.error('Filtering error:', err);
                setError('데이터 필터링 중 오류가 발생했습니다.');
            }
        };
    
        // 디바운스 처리
        const debounceTimeout = setTimeout(() => {
            fetchFilteredData();
        }, 300);
    
        return () => clearTimeout(debounceTimeout);
    }, [selectedLevel, selectedModule, searchTerm]);

    // 코드 하이라이팅
    useEffect(() => {
        if (showCode) {
            Prism.highlightAll();
        }
    }, [showCode]);

    const fetchModuleData = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/modules');
            if (!response.ok) throw new Error('모듈 데이터 조회 실패');

            const data = await response.json();
            setModuleData(data);
        } catch (err) {
            console.error('Module data fetching error:', err);
            setError('모듈 데이터를 불러오는데 실패했습니다.');
        }
    };

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
            const encodedUserName = encodeURIComponent(userName);
            const response = await fetch(`http://localhost:3001/api/submissions/user/${encodedUserName}`);
            if (!response.ok) throw new Error('제출된 과제 조회 실패');
            
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
                setSubmitError('파일 크기는 5MB를 초과할 수 없습니다.');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                setSubmitError('이미지 파일만 업로드 가능합니다.');
                return;
            }

            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setSubmitError('');
        }
    };

    useEffect(() => {
        const handleLoginChange = async () => {
            const storedName = localStorage.getItem('userName');
            setUserName(storedName || '');
    
            if (storedName) {
                await Promise.all([
                    fetchCompletedAssignments(storedName),
                    fetchSubmittedAssignments(storedName)
                ]);
                await fetchModuleData();
            }
        };
    
        window.addEventListener('loginChange', handleLoginChange);
        return () => {
            window.removeEventListener('loginChange', handleLoginChange);
        };
    }, []);

    // 과제 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedImage) {
            setSubmitError('이미지를 선택해주세요.');
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
            setSubmittedAssignments([...submittedAssignments, submissionData.name]);
            
            setTimeout(() => {
                resetSubmissionForm();
            }, 2000);
            
        } catch (error) {
            setSubmitError(error.message || '과제 제출 중 오류가 발생했습니다.');
        }
    };
// 제출 폼 초기화
const resetSubmissionForm = () => {
    setDescription('');
    setSelectedImage(null);
    setPreviewUrl('');
    setSubmitError('');
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
    setSubmitError('');
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

if (loading) {
    return <div className="loading">Loading...</div>;
}

if (error) {
    return <div className="error-message">{error}</div>;
}

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
                                {moduleData.map((item, index) => (
                                    <tr key={item.idx}>
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
                                {submitError && <div className="error-message">{submitError}</div>}
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