import { useState, useRef, useEffect } from 'react';
import { uploadImage } from '../api/image';
import { Image as ImageIcon, X, Upload } from 'lucide-react';
import './ImageUpload.css';

const ImageUpload = ({ onUpload, initialUrl = '', label = 'Upload Image', className = '' }) => {
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
            alert('Failed to upload image. Please try again.');
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
                        <span>Uploading...</span>
                    </div>
                ) : imageUrl ? (
                    <div className="image-preview-wrapper">
                        <img src={imageUrl} alt="Uploaded" className="image-preview" />
                        <button
                            type="button"
                            className="remove-image-btn"
                            onClick={handleRemove}
                            title="Remove image"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="upload-placeholder">
                        <Upload size={24} className="upload-icon" />
                        <span>Click to upload</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
