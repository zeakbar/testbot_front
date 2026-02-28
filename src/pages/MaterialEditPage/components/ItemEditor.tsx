import type { FC } from 'react';
import { useState } from 'react';
import type { MaterialItem, MaterialOption } from '@/api/types';
import type { MaterialType } from '@/api/materials';
import './ItemEditor.css';

interface ItemEditorProps {
  item: MaterialItem;
  index: number;
  materialType: MaterialType;
  onChange: (item: MaterialItem) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const ItemEditor: FC<ItemEditorProps> = ({
  item,
  index,
  materialType,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleFieldChange = (field: string, value: unknown) => {
    onChange({ ...item, [field]: value });
  };
  
  const getPreviewText = (): string => {
    switch (materialType) {
      case 'quiz':
        return String(item.question ?? 'Yangi savol');
      case 'flashcards':
        return String(item.front ?? item.term ?? 'Yangi kartochka');
      case 'roulette':
        return String(item.question ?? 'Yangi savol');
      case 'matching':
        return `${String(item.left ?? '...')} ↔ ${String(item.right ?? '...')}`;
      case 'fill_blanks':
        return String(item.sentence ?? 'Yangi gap');
      case 'true_false':
        return String(item.statement ?? 'Yangi tasdiq');
      default:
        return `Element #${index + 1}`;
    }
  };
  
  const renderEditor = () => {
    switch (materialType) {
      case 'quiz':
        return <QuizItemEditor item={item} onChange={handleFieldChange} />;
      case 'flashcards':
        return <FlashcardItemEditor item={item} onChange={handleFieldChange} />;
      case 'roulette':
        return <RouletteItemEditor item={item} onChange={handleFieldChange} />;
      case 'matching':
        return <MatchingItemEditor item={item} onChange={handleFieldChange} />;
      case 'fill_blanks':
        return <FillBlanksItemEditor item={item} onChange={handleFieldChange} />;
      case 'true_false':
        return <TrueFalseItemEditor item={item} onChange={handleFieldChange} />;
      default:
        return <div>Noma'lum tur</div>;
    }
  };
  
  return (
    <div className="item-editor">
      {/* Header */}
      <div className="item-editor-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="item-number">{index + 1}</div>
        <div className="item-preview">{getPreviewText()}</div>
        <div className="item-actions">
          <button 
            className="item-action-btn"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={!canMoveUp}
            title="Yuqoriga"
          >
            ↑
          </button>
          <button 
            className="item-action-btn"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={!canMoveDown}
            title="Pastga"
          >
            ↓
          </button>
          <button 
            className="item-action-btn delete"
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
            title="O'chirish"
          >
            🗑️
          </button>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>
      
      {/* Content */}
      {isExpanded && (
        <div className="item-editor-content">
          {renderEditor()}
        </div>
      )}
      
      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="item-delete-confirm">
          <span>O'chirishni tasdiqlaysizmi?</span>
          <button className="confirm-btn cancel" onClick={() => setShowDeleteConfirm(false)}>
            Yo'q
          </button>
          <button className="confirm-btn delete" onClick={onDelete}>
            Ha
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TYPE-SPECIFIC EDITORS
// ============================================================================

interface EditorProps {
  item: MaterialItem;
  onChange: (field: string, value: unknown) => void;
}

/** Normalize quiz options: API may send strings or objects with different shapes */
function normalizeQuizOptions(
  rawOptions: unknown[],
  answer?: string,
  answerIndex?: number
): MaterialOption[] {
  if (!rawOptions?.length) return [];
  return rawOptions.map((opt, idx) => {
    if (typeof opt === 'string') {
      return {
        id: idx,
        text: opt,
        is_correct: answerIndex !== undefined ? idx === answerIndex : opt === answer,
      };
    }
    if (opt && typeof opt === 'object' && !Array.isArray(opt)) {
      const o = opt as Record<string, unknown>;
      return {
        id: (o.id as string | number) ?? idx,
        text: (o.text as string) ?? (o.answer as string) ?? String(o),
        is_correct:
          o.is_correct !== undefined
            ? Boolean(o.is_correct)
            : answerIndex !== undefined
              ? idx === answerIndex
              : (o.text ?? o.answer) === answer,
      };
    }
    return { id: idx, text: String(opt), is_correct: idx === answerIndex };
  });
}

const DEFAULT_QUIZ_OPTIONS: MaterialOption[] = [
  { id: 'a', text: '', is_correct: true },
  { id: 'b', text: '', is_correct: false },
];

// Quiz Item Editor
const QuizItemEditor: FC<EditorProps> = ({ item, onChange }) => {
  const rawOptions = (item.options || []) as unknown[];
  const normalized = normalizeQuizOptions(
    rawOptions,
    item.answer as string | undefined,
    item.answer_index as number | undefined
  );
  const options = normalized.length >= 2 ? normalized : DEFAULT_QUIZ_OPTIONS;
  
  const handleOptionChange = (optIndex: number, field: string, value: unknown) => {
    const newOptions = [...options];
    newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
    onChange('options', newOptions);
  };
  
  const handleCorrectChange = (optIndex: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === optIndex,
    }));
    onChange('options', newOptions);
  };
  
  const addOption = () => {
    const letters = 'abcdefghij';
    const newId = letters[options.length] || `opt${options.length + 1}`;
    onChange('options', [...options, { id: newId, text: '', is_correct: false }]);
  };
  
  const removeOption = (optIndex: number) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== optIndex);
    // Ensure at least one correct
    if (!newOptions.some(o => o.is_correct) && newOptions.length > 0) {
      newOptions[0].is_correct = true;
    }
    onChange('options', newOptions);
  };
  
  return (
    <div className="type-editor quiz-editor">
      <div className="editor-field">
        <label>Savol</label>
        <textarea
          value={String(item.question ?? '')}
          onChange={(e) => onChange('question', e.target.value)}
          placeholder="Savolni yozing..."
          rows={2}
        />
      </div>
      
      <div className="editor-field">
        <label>Variantlar</label>
        <div className="quiz-options-editor">
          {options.map((opt, idx) => (
            <div key={opt.id} className="quiz-option-row">
              <input
                type="radio"
                name={`correct-${item.id}`}
                checked={Boolean(opt.is_correct)}
                onChange={() => handleCorrectChange(idx)}
                title="To'g'ri javob"
              />
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <input
                type="text"
                value={String(opt.text ?? '')}
                onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                placeholder={`Variant ${String.fromCharCode(65 + idx)}`}
              />
              {options.length > 2 && (
                <button 
                  className="remove-option-btn"
                  onClick={() => removeOption(idx)}
                  title="Variantni o'chirish"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button className="add-option-btn" onClick={addOption}>
              + Variant qo'shish
            </button>
          )}
        </div>
      </div>
      
      <div className="editor-field">
        <label>Izoh (ixtiyoriy)</label>
        <textarea
          value={String(item.explanation ?? '')}
          onChange={(e) => onChange('explanation', e.target.value)}
          placeholder="Javob izohi..."
          rows={2}
        />
      </div>
    </div>
  );
};

// Flashcard Item Editor
const FlashcardItemEditor: FC<EditorProps> = ({ item, onChange }) => {
  return (
    <div className="type-editor flashcard-editor">
      <div className="editor-field">
        <label>Oldi (savol/atama)</label>
        <textarea
          value={String(item.front ?? item.term ?? '')}
          onChange={(e) => onChange('front', e.target.value)}
          placeholder="Kartochka oldi..."
          rows={2}
        />
      </div>
      
      <div className="editor-field">
        <label>Orqa (javob/ta'rif)</label>
        <textarea
          value={String(item.back ?? item.definition ?? '')}
          onChange={(e) => onChange('back', e.target.value)}
          placeholder="Kartochka orqasi..."
          rows={2}
        />
      </div>
      
      <div className="editor-field">
        <label>Maslahat (ixtiyoriy)</label>
        <input
          type="text"
          value={String(item.hint ?? '')}
          onChange={(e) => onChange('hint', e.target.value)}
          placeholder="Yodlashga yordam beruvchi maslahat..."
        />
      </div>
    </div>
  );
};

// Roulette Item Editor
const RouletteItemEditor: FC<EditorProps> = ({ item, onChange }) => {
  return (
    <div className="type-editor roulette-editor">
      <div className="editor-field">
        <label>Savol</label>
        <textarea
          value={String(item.question ?? '')}
          onChange={(e) => onChange('question', e.target.value)}
          placeholder="Savolni yozing..."
          rows={2}
        />
      </div>
      
      <div className="editor-field">
        <label>Javob</label>
        <textarea
          value={String(item.answer ?? '')}
          onChange={(e) => onChange('answer', e.target.value)}
          placeholder="Javobni yozing..."
          rows={2}
        />
      </div>
    </div>
  );
};

// Matching Item Editor – vertical layout to avoid overlap on mobile
const MatchingItemEditor: FC<EditorProps> = ({ item, onChange }) => {
  return (
    <div className="type-editor matching-editor">
      <div className="editor-field">
        <label>Chap (atama)</label>
        <input
          type="text"
          value={String(item.left ?? item.term ?? '')}
          onChange={(e) => onChange('left', e.target.value)}
          placeholder="Birinchi element..."
        />
      </div>
      <div className="editor-field">
        <label>O'ng (mos)</label>
        <input
          type="text"
          value={String(item.right ?? item.match ?? '')}
          onChange={(e) => onChange('right', e.target.value)}
          placeholder="Mos element..."
        />
      </div>
    </div>
  );
};

// Fill Blanks Item Editor
const FillBlanksItemEditor: FC<EditorProps> = ({ item, onChange }) => {
  return (
    <div className="type-editor fillblanks-editor">
      <div className="editor-field">
        <label>Gap (bo'sh joy uchun _____ yozing)</label>
        <textarea
          value={String(item.sentence ?? item.text ?? '')}
          onChange={(e) => onChange('sentence', e.target.value)}
          placeholder="Fotosintez jarayonida _____ gazi ishlatiladi."
          rows={2}
        />
      </div>
      
      <div className="editor-field">
        <label>To'g'ri javob</label>
        <input
          type="text"
          value={String(item.answer ?? item.correct_answer ?? '')}
          onChange={(e) => onChange('answer', e.target.value)}
          placeholder="Bo'sh joyga kiritiladigan so'z..."
        />
      </div>
      
      <div className="editor-field">
        <label>Maslahat (ixtiyoriy)</label>
        <input
          type="text"
          value={String(item.hint ?? '')}
          onChange={(e) => onChange('hint', e.target.value)}
          placeholder="Javobga ishora..."
        />
      </div>
    </div>
  );
};

// True/False Item Editor
const TrueFalseItemEditor: FC<EditorProps> = ({ item, onChange }) => {
  const isTrue = item.is_true ?? item.is_correct ?? true;
  
  return (
    <div className="type-editor truefalse-editor">
      <div className="editor-field">
        <label>Tasdiq</label>
        <textarea
          value={String(item.statement ?? item.question ?? '')}
          onChange={(e) => onChange('statement', e.target.value)}
          placeholder="To'g'ri yoki noto'g'ri tasdiq yozing..."
          rows={2}
        />
      </div>
      
      <div className="editor-field">
        <label>Javob</label>
        <div className="truefalse-toggle">
          <button 
            className={`toggle-btn ${isTrue ? 'active' : ''}`}
            onClick={() => onChange('is_true', true)}
          >
            ✓ To'g'ri
          </button>
          <button 
            className={`toggle-btn ${!isTrue ? 'active' : ''}`}
            onClick={() => onChange('is_true', false)}
          >
            ✕ Noto'g'ri
          </button>
        </div>
      </div>
      
      <div className="editor-field">
        <label>Izoh (ixtiyoriy)</label>
        <textarea
          value={String(item.explanation ?? '')}
          onChange={(e) => onChange('explanation', e.target.value)}
          placeholder="Nima uchun to'g'ri yoki noto'g'ri ekanligi..."
          rows={2}
        />
      </div>
    </div>
  );
};
