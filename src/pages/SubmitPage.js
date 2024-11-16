import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const SubmitPage = () => {
    const [userRole, setUserRole] = useState('');
    const [description, setDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        setUserRole(storedRole || '');
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedImage) {
            setError('이미지를 선택해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('userName', localStorage.getItem('userName'));
        formData.append('description', description);

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
            setDescription('');
            setSelectedImage(null);
            setPreviewUrl('');
            
        } catch (error) {
            setError(error.message || '과제 제출 중 오류가 발생했습니다.');
        }
    };

    if (userRole === 'admin' || userRole === 'manager') {
        return <Navigate to="/" />;
    }

    return (
        <div className="submit-page">
            <div className="submit-container">
                <h1>과제 제출</h1>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <form onSubmit={handleSubmit} className="submit-form">
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
                            <div className="image-preview">
                                <img src={previewUrl} alt="Preview" />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="submit-button">
                        제출하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitPage;