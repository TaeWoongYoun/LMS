import React, { useState } from 'react';
import './InsertPage.css';

const InsertPage = () => {
  const [formData, setFormData] = useState({
    level: '',
    module: '',
    folderName: '', // 경로상에 사용될 폴더명
    projectName: '', // 실제 프로젝트 표시될 이름
    description: '',
    htmlCode: '',
    cssCode: '',
    jsCode: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 유효성 검사
  const validateForm = () => {
    if (!formData.folderName.match(/^[a-zA-Z0-9-_]+$/)) {
      setError('폴더명은 영문자, 숫자, 하이픈, 언더스코어만 사용할 수 있습니다.');
      return false;
    }
    
    if (!formData.htmlCode.trim()) {
      setError('HTML 코드는 필수입니다.');
      return false;
    }
    
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const moduleFolder = `${formData.module}module`.toLowerCase();
      const sanitizedFolderName = formData.folderName.trim().toLowerCase();

      const newData = {
        iframeData: {
          level: parseInt(formData.level),
          module: formData.module,
          name: formData.projectName.trim(), // 프로젝트 표시 이름
          description: formData.description,
          path: `/${moduleFolder}/${sanitizedFolderName}/index.html`,
          title: `${moduleFolder}-${sanitizedFolderName}`
        },
        files: {
          html: formData.htmlCode,
          css: formData.cssCode || '/* No CSS provided */',
          js: formData.jsCode || '// No JavaScript provided'
        }
      };

      const response = await fetch('http://localhost:3001/api/save-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '서버 응답 오류');
      }

      setSuccess('데이터가 성공적으로 저장되었습니다!');
      setFormData({
        level: '',
        module: '',
        folderName: '',
        projectName: '',
        description: '',
        htmlCode: '',
        cssCode: '',
        jsCode: ''
      });

    } catch (error) {
      console.error('Error:', error);
      setError(error.message || '데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="insert-page-container">
      <h1>모듈 추가</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="module-form">
        <div className="form-group">
          <label>난이도:</label>
          <select name="level" value={formData.level} onChange={handleChange} requireddisabled={isLoading}>
            <option value="">선택하세요</option>
            {[0, 1, 2, 3, 4, 5].map(level => (
              <option key={level} value={level}>Lv. {level}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>모듈:</label>
          <select name="module" value={formData.module} onChange={handleChange} requireddisabled={isLoading}>
            <option value="">선택하세요</option>
            <option value="A">A모듈</option>
            <option value="B">B모듈</option>
          </select>
        </div>

        <div className="form-group">
          <label>폴더명: (영문, 숫자, 하이픈, 언더스코어만 사용)</label>
          <input type="text" name="folderName" value={formData.folderName} onChange={handleChange} required disabled={isLoading} placeholder="예: button-hover, login-form"/>
        </div>

        <div className="form-group">
          <label>프로젝트 이름: (실제 표시될 이름)</label>
          <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} required disabled={isLoading} placeholder="예: 호버 효과 버튼, 로그인 폼"/>
        </div>

        <div className="form-group">
          <label>부가설명:</label>
          <input type="text" name="description" value={formData.description} onChange={handleChange} required disabled={isLoading} placeholder="예: hover 효과가 적용된 버튼 컴포넌트"/>
        </div>

        <div className="form-group">
          <label>HTML 코드:</label>
          <textarea name="htmlCode" value={formData.htmlCode} onChange={handleChange} required disabled={isLoading} placeholder="<!DOCTYPE html>..."/>
        </div>

        <div className="form-group">
          <label>CSS 코드:</label>
          <textarea name="cssCode" value={formData.cssCode} onChange={handleChange} disabled={isLoading} placeholder="/* CSS 코드를 입력하세요 */"/>
        </div>

        <div className="form-group">
          <label>JavaScript 코드:</label>
          <textarea name="jsCode" value={formData.jsCode} onChange={handleChange} disabled={isLoading} placeholder="// JavaScript 코드를 입력하세요"/>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? '저장 중...' : '저장하기'}
        </button>
      </form>
    </div>
  );
};

export default InsertPage;