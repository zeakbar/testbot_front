import type { FC } from 'react';
import type { MaterialContent } from '@/api/types';
import './MetaEditor.css';

interface MetaEditorProps {
  content: MaterialContent;
  onChange: (field: string, value: unknown) => void;
}

export const MetaEditor: FC<MetaEditorProps> = ({ content, onChange }) => {
  return (
    <div className="meta-editor">
      {/* Title */}
      <div className="meta-field">
        <label>Sarlavha</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Material sarlavhasi..."
        />
      </div>
      
      {/* Instructions */}
      <div className="meta-field">
        <label>Ko'rsatmalar</label>
        <textarea
          value={content.instructions || ''}
          onChange={(e) => onChange('instructions', e.target.value)}
          placeholder="O'quvchilar uchun ko'rsatmalar..."
          rows={3}
        />
      </div>
      
      {/* Grade Level */}
      <div className="meta-field">
        <label>Sinf darajasi</label>
        <select
          value={content.grade_level || ''}
          onChange={(e) => onChange('grade_level', e.target.value)}
        >
          <option value="">Tanlanmagan</option>
          <option value="5-sinf">5-sinf</option>
          <option value="6-sinf">6-sinf</option>
          <option value="7-sinf">7-sinf</option>
          <option value="8-sinf">8-sinf</option>
          <option value="9-sinf">9-sinf</option>
          <option value="10-sinf">10-sinf</option>
          <option value="11-sinf">11-sinf</option>
          <option value="universitet">Universitet</option>
          <option value="umumiy">Umumiy</option>
        </select>
      </div>
      
      {/* Config Section */}
      <div className="meta-section">
        <h3>Sozlamalar</h3>
        
        {/* Shuffle */}
        <div className="meta-checkbox">
          <label>
            <input
              type="checkbox"
              checked={content.config?.shuffle_items ?? true}
              onChange={(e) => onChange('config', {
                ...content.config,
                shuffle_items: e.target.checked,
              })}
            />
            Elementlarni aralashtirish
          </label>
          <span className="meta-hint">
            Har safar tartib tasodifiy bo'ladi
          </span>
        </div>
        
        {/* Time Limit */}
        <div className="meta-field">
          <label>Vaqt chegarasi (soniya)</label>
          <input
            type="number"
            value={content.config?.time_limit_seconds || ''}
            onChange={(e) => onChange('config', {
              ...content.config,
              time_limit_seconds: e.target.value ? parseInt(e.target.value) : null,
            })}
            placeholder="Chegarasiz"
            min={0}
          />
          <span className="meta-hint">
            Bo'sh qoldiring - cheksiz vaqt
          </span>
        </div>
        
        {/* Points per correct */}
        <div className="meta-field">
          <label>Har bir to'g'ri javob uchun ball</label>
          <input
            type="number"
            value={content.config?.points_per_correct || 100}
            onChange={(e) => onChange('config', {
              ...content.config,
              points_per_correct: parseInt(e.target.value) || 100,
            })}
            min={1}
          />
        </div>
      </div>
      
      {/* Info Section */}
      <div className="meta-info">
        <h3>Ma'lumot</h3>
        <div className="info-row">
          <span>Versiya:</span>
          <span>{content.version || '1.0'}</span>
        </div>
        <div className="info-row">
          <span>Tur:</span>
          <span>{content.type}</span>
        </div>
        <div className="info-row">
          <span>Elementlar soni:</span>
          <span>{content.body?.items?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};
