import { FC, useRef, ChangeEvent } from 'react';
import { FiTrash2, FiImage, FiEdit2 } from 'react-icons/fi';
import './ImageUpload.css';

interface ImageUploadProps {
  imageUrl?: string | null;
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const ImageUpload: FC<ImageUploadProps> = ({
  imageUrl,
  onImageChange,
  disabled = false,
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onImageChange(null);
  };

  return (
    <div className={`image-upload ${compact ? 'image-upload-compact' : ''}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="image-upload-input"
        disabled={disabled}
      />

      {imageUrl || inputRef.current?.files?.[0] ? (
        <div className="image-upload-with-image">
          <div className="image-upload-preview-wrapper">
            {inputRef.current?.files?.[0] ? (
              <img
                src={URL.createObjectURL(inputRef.current.files[0])}
                alt="Preview"
                className="image-upload-preview"
              />
            ) : imageUrl ? (
              <img src={imageUrl} alt="Current" className="image-upload-preview" />
            ) : null}
          </div>
          <div className="image-upload-overlay">
            <button
              type="button"
              onClick={handleClick}
              className="image-upload-overlay-btn"
              disabled={disabled}
              title="Change image"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="image-upload-overlay-btn image-upload-delete-btn"
              disabled={disabled}
              title="Remove image"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="image-upload-button"
          onClick={handleClick}
          disabled={disabled}
          title="Upload image"
        >
          <FiImage size={20} />
        </button>
      )}
    </div>
  );
};
