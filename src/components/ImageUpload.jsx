import { useState, useRef, useEffect } from 'react';
import { uploadImage } from '../api/image';
import { X, Upload } from 'lucide-react';
import './ImageUpload.css';

const ImageUpload = ({ onUpload, initialUrl = '', label = '이미지 업로드', className = '' }) => {
    const [imageUrl, setImageUrl] = useState(initialUrl);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setImageUrl(initialUrl);
    }, [initialUrl]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const result = await uploadImage(file);
            setImageUrl(result.url);
            onUpload(result.url);
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('이미지를 업로드하지 못했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setImageUrl('');
        onUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className={`image-upload-container ${className}`}>
            <label className="image-upload-label">{label}</label>
            <div
                className={`image-upload-area ${imageUrl ? 'has-image' : ''}`}
                onClick={triggerUpload}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden-input"
                />

                {loading ? (
                    <div className="upload-loading">
                        <div className="spinner"></div>
                        <span>업로드 중...</span>
                    </div>
                ) : imageUrl ? (
                    <div className="image-preview-wrapper">
                        <img src={imageUrl} alt="업로드한 이미지" className="image-preview" />
                        <button
                            type="button"
                            className="remove-image-btn"
                            onClick={handleRemove}
                            title="이미지 삭제"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="upload-placeholder">
                        <Upload size={24} className="upload-icon" />
                        <span>이미지 업로드</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
