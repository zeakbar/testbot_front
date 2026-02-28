import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import { getMaterialById, updateMaterial, getMaterialConfig, type MaterialType } from '@/api/materials';
import type { Material, MaterialContent, MaterialItem } from '@/api/types';
import { useAuth } from '@/context/AuthContext';

// Editors for different types
import { ItemEditor } from './components/ItemEditor';
import { MetaEditor } from './components/MetaEditor';

import './MaterialEditPage.css';

type EditTab = 'content' | 'settings';

export const MaterialEditPage: FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [material, setMaterial] = useState<Material | null>(null);
  const [editedContent, setEditedContent] = useState<MaterialContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<EditTab>('content');
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  
  useEffect(() => {
    const fetchMaterial = async () => {
      if (!materialId) {
        setError('Material ID topilmadi');
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await getMaterialById(materialId);
        setMaterial(data);
        setEditedContent(JSON.parse(JSON.stringify(data.content))); // Deep copy
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Material yuklanmadi');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMaterial();
  }, [materialId]);
  
  const config = material ? getMaterialConfig(material.type as MaterialType) : null;
  const isOwner = user && material && user.user_id === material.author.user_id;
  
  // Update item in content
  const handleItemChange = useCallback((index: number, updatedItem: MaterialItem) => {
    if (!editedContent) return;
    
    const newItems = [...(editedContent.body?.items || [])];
    newItems[index] = updatedItem;
    
    setEditedContent({
      ...editedContent,
      body: { ...editedContent.body, items: newItems },
    });
    setHasChanges(true);
  }, [editedContent]);
  
  // Add new item
  const handleAddItem = useCallback(() => {
    if (!editedContent || !material) return;
    
    const items = editedContent.body?.items || [];
    const newItem = createEmptyItem(material.type as MaterialType, items.length + 1);
    
    setEditedContent({
      ...editedContent,
      body: { ...editedContent.body, items: [...items, newItem] },
    });
    setHasChanges(true);
  }, [editedContent, material]);
  
  // Delete item
  const handleDeleteItem = useCallback((index: number) => {
    if (!editedContent) return;
    
    const newItems = [...(editedContent.body?.items || [])];
    newItems.splice(index, 1);
    
    // Re-index items
    newItems.forEach((item, i) => {
      item.id = i + 1;
    });
    
    setEditedContent({
      ...editedContent,
      body: { ...editedContent.body, items: newItems },
    });
    setHasChanges(true);
  }, [editedContent]);
  
  // Move item up/down
  const handleMoveItem = useCallback((index: number, direction: 'up' | 'down') => {
    if (!editedContent) return;
    
    const newItems = [...(editedContent.body?.items || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newItems.length) return;
    
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    // Re-index
    newItems.forEach((item, i) => {
      item.id = i + 1;
    });
    
    setEditedContent({
      ...editedContent,
      body: { ...editedContent.body, items: newItems },
    });
    setHasChanges(true);
  }, [editedContent]);
  
  // Update meta fields
  const handleMetaChange = useCallback((field: string, value: unknown) => {
    if (!editedContent) return;
    
    setEditedContent({
      ...editedContent,
      [field]: value,
    });
    setHasChanges(true);
  }, [editedContent]);
  
  // Save changes
  const handleSave = async () => {
    if (!materialId || !editedContent || !hasChanges) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      await updateMaterial(materialId, {
        content: editedContent,
      });
      
      setHasChanges(false);
      // Optionally navigate back or show success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saqlashda xatolik');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle back with unsaved changes
  const handleBack = () => {
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      navigate(-1);
    }
  };
  
  if (isLoading) {
    return (
      <Page back={false}>
        <Loading message="Material yuklanmoqda..." />
      </Page>
    );
  }
  
  if (error || !material || !editedContent) {
    return (
      <Page back={true}>
        <div className="edit-error">
          <h2>😕 Xatolik</h2>
          <p>{error || 'Material topilmadi'}</p>
          <button onClick={() => navigate(-1)}>Orqaga</button>
        </div>
      </Page>
    );
  }
  
  if (!isOwner) {
    return (
      <Page back={true}>
        <div className="edit-error">
          <h2>🔒 Ruxsat yo'q</h2>
          <p>Siz bu materialni tahrirlash huquqiga ega emassiz.</p>
          <button onClick={() => navigate(-1)}>Orqaga</button>
        </div>
      </Page>
    );
  }
  
  const items = editedContent.body?.items || [];
  
  return (
    <Page back={false}>
      <div className="edit-page">
        {/* Header */}
        <div className="edit-header">
          <button className="edit-back-btn" onClick={handleBack}>
            ← Orqaga
          </button>
          <div className="edit-header-info">
            <span className="edit-type-badge" style={{ backgroundColor: config?.color }}>
              {config?.icon} {config?.title}
            </span>
            {hasChanges && (
              <span className="edit-unsaved-badge" title="Saqlanmagan">
                <FiEdit2 size={18} />
              </span>
            )}
          </div>
          <button 
            className="edit-save-btn"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
        
        {/* Tabs */}
        <div className="edit-tabs">
          <button 
            className={`edit-tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            📝 Kontent ({items.length})
          </button>
          <button 
            className={`edit-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Sozlamalar
          </button>
        </div>
        
        {/* Error */}
        {error && (
          <div className="edit-error-banner">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="edit-content-tab">
            {/* Items List */}
            <div className="edit-items-list">
              {items.map((item, index) => (
                <ItemEditor
                  key={item.id || index}
                  item={item}
                  index={index}
                  materialType={material.type as MaterialType}
                  onChange={(updated) => handleItemChange(index, updated)}
                  onDelete={() => handleDeleteItem(index)}
                  onMoveUp={() => handleMoveItem(index, 'up')}
                  onMoveDown={() => handleMoveItem(index, 'down')}
                  canMoveUp={index > 0}
                  canMoveDown={index < items.length - 1}
                />
              ))}
            </div>
            
            {/* Add Button */}
            <button className="edit-add-btn" onClick={handleAddItem}>
              + Element qo'shish
            </button>
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="edit-settings-tab">
            <MetaEditor
              content={editedContent}
              onChange={handleMetaChange}
            />
          </div>
        )}
      </div>
      
      {/* Discard Modal */}
      {showDiscardModal && (
        <div className="modal-overlay" onClick={() => setShowDiscardModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>O'zgarishlarni bekor qilish?</h3>
            <p>Saqlanmagan o'zgarishlar yo'qoladi.</p>
            <div className="modal-actions">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowDiscardModal(false)}
              >
                Qolish
              </button>
              <button 
                className="modal-btn modal-btn-danger"
                onClick={() => navigate(-1)}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

// Helper to create empty item based on type
function createEmptyItem(type: MaterialType, id: number): MaterialItem {
  switch (type) {
    case 'quiz':
      return {
        id,
        question: '',
        options: [
          { id: 'a', text: '', is_correct: true },
          { id: 'b', text: '', is_correct: false },
          { id: 'c', text: '', is_correct: false },
          { id: 'd', text: '', is_correct: false },
        ],
        explanation: '',
      };
    case 'flashcards':
      return {
        id,
        front: '',
        back: '',
        hint: '',
      };
    case 'roulette':
      return {
        id,
        question: '',
        answer: '',
        hints: [],
      };
    case 'matching':
      return {
        id,
        left: '',
        right: '',
      };
    case 'fill_blanks':
      return {
        id,
        sentence: '',
        answer: '',
        hint: '',
      };
    case 'true_false':
      return {
        id,
        statement: '',
        is_true: true,
        explanation: '',
      };
    default:
      return { id };
  }
}
