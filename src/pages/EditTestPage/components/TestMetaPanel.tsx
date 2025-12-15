import { FC, useState } from 'react';
import type { EditableTest } from '@/api/testEdit';
import { uploadTestImage } from '@/api/testEdit';
import { ImageUpload } from './ImageUpload';
import './TestMetaPanel.css';

interface TestMetaPanelProps {
  test: EditableTest;
  onChange: (updates: Partial<EditableTest>) => void;
  canEdit: boolean;
  isSaving: boolean;
}

export const TestMetaPanel: FC<TestMetaPanelProps> = ({ test, onChange, canEdit, isSaving }) => {
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ topic: e.target.value } as Partial<EditableTest>);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ description: e.target.value } as Partial<EditableTest>);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ difficulty_level: e.target.value as any } as Partial<EditableTest>);
  };

  const handleOpenPeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onChange({ open_period: isNaN(value) ? 0 : value } as Partial<EditableTest>);
  };

  const handlePublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ is_public: e.target.checked } as Partial<EditableTest>);
  };

  const handleImageChange = async (file: File | null) => {
    setImageUploadError(null);

    if (!file) {
      onChange({ image: null } as Partial<EditableTest>);
      return;
    }

    try {
      setIsUploadingImage(true);
      const updatedTest = await uploadTestImage(test.id, file);
      onChange({ image: updatedTest.image } as Partial<EditableTest>);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rasmni yuklashda xato';
      setImageUploadError(errorMessage);
      console.error('Error uploading test image:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };


  return (
    <div className="test-meta-panel">
      <h2 className="test-meta-panel-title">Test haqida</h2>

      <div className="test-meta-form-group">
        <label className="test-meta-label">Test muqovasi rasmi</label>
        <div className="test-meta-image-section">
          <ImageUpload
            imageUrl={test.image}
            onImageChange={handleImageChange}
            disabled={!canEdit || isUploadingImage}
            compact
          />
          {isUploadingImage && <span className="test-meta-uploading">Yuklanyapti...</span>}
        </div>
        {imageUploadError && <p className="test-meta-image-error">{imageUploadError}</p>}
      </div>

      <div className="test-meta-form-group">
        <label htmlFor="topic" className="test-meta-label">
          Mavzu / Sarlavha {isSaving && <span className="test-meta-saving">Saqlanyapti...</span>}
        </label>
        <input
          id="topic"
          type="text"
          className="test-meta-input"
          value={test.topic}
          onChange={handleTopicChange}
          disabled={!canEdit}
          placeholder="Test mavzusini kiriting"
        />
      </div>

      <div className="test-meta-form-group">
        <label htmlFor="description" className="test-meta-label">
          Tavsif
        </label>
        <textarea
          id="description"
          className="test-meta-textarea"
          value={test.description}
          onChange={handleDescriptionChange}
          disabled={!canEdit}
          placeholder="Test tavsifini kiriting"
          rows={4}
        />
      </div>

      <div className="test-meta-grid">
        <div className="test-meta-form-group">
          <label htmlFor="difficulty" className="test-meta-label">
            Qiyinlik darajasi
          </label>
          <select
            id="difficulty"
            className="test-meta-select"
            value={test.difficulty_level}
            onChange={handleDifficultyChange}
            disabled={!canEdit}
          >
            <option value="easy">Oson</option>
            <option value="medium">O'rtacha</option>
            <option value="hard">Qiyin</option>
          </select>
        </div>

        <div className="test-meta-form-group">
          <label htmlFor="open_period" className="test-meta-label">
            Vaqt chegarasi (minut)
          </label>
          <input
            id="open_period"
            type="number"
            className="test-meta-input"
            value={test.open_period}
            onChange={handleOpenPeriodChange}
            disabled={!canEdit}
            min="0"
            placeholder="0 - cheksizlik"
          />
        </div>
      </div>

      <div className="test-meta-form-group">
        <label className="test-meta-checkbox-label">
          <input
            type="checkbox"
            checked={test.is_public}
            onChange={handlePublicChange}
            disabled={!canEdit}
            className="test-meta-checkbox"
          />
          <span>Ushbu testni ommaviy qiling</span>
        </label>
      </div>
    </div>
  );
};
