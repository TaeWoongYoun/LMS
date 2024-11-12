import iframeData from "../data/iframeData"
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function DataPage() {
    const [searchTerm, setSearchTerm] = useState(''); 
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedModule, setSelectedModule] = useState(''); 
    const [userName, setUserName] = useState(''); 
    const [data, setData] = useState(iframeData);

    // 데이터 삭제 처리
    const handleDelete = async (item) => {
        if (window.confirm('정말로 이 데이터를 삭제하시겠습니까?')) {
            try {
                const response = await fetch('http://localhost:3001/api/delete-module', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: item.path,
                        name: item.name
                    })
                });

                if (response.ok) {
                    // 성공적으로 삭제되면 현재 상태에서도 해당 항목 제거
                    setData(prevData => prevData.filter(dataItem => dataItem.path !== item.path));
                    alert('성공적으로 삭제되었습니다.');
                } else {
                    alert('삭제 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    // 데이터 필터링
    const filteredData = data.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
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

    // admin 계정 확인
    const isAdmin = userName === 'admin';

    return (
        <div className="data-page">
            <div className="content">
                {isAdmin ? (
                    <>
                        <h1>데이터 관리</h1>
                        {/* 검색 및 필터링 영역 */}
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

                        {/* 데이터 테이블 */}
                        <div className="table-area">
                            <table>
                                <thead>
                                    <tr>
                                        <th>난이도</th>
                                        <th>모듈</th>
                                        <th>폴더명</th>
                                        <th>부가설명</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => (
                                        <tr key={index}>
                                            <td>Lv. {item.level}</td>
                                            <td>{item.module}모듈</td>
                                            <td>{item.name}</td>
                                            <td>{item.description}</td>
                                            <td>
                                                <button 
                                                    onClick={() => handleDelete(item)}
                                                    className="delete-btn"
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="access-denied">
                        <h2>접근 권한이 없습니다</h2>
                        <p>이 페이지는 관리자만 접근할 수 있습니다.</p>
                        <Link to="/">메인 페이지로 돌아가기</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DataPage;