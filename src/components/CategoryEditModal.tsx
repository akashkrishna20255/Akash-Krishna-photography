import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Check, RefreshCw, Layers, Edit3 } from 'lucide-react';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  allLabel: string;
  onSave: (newCategories: string[], newAllLabel: string, renames: { from: string; to: string }[]) => void;
  photoCounts?: Record<string, number>;
}

export const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  isOpen,
  onClose,
  categories,
  allLabel,
  onSave,
  photoCounts = {}
}) => {
  const [editedCategories, setEditedCategories] = useState<string[]>([]);
  const [editedAllLabel, setEditedAllLabel] = useState('All');
  const [newCatInput, setNewCatInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep track of original names to build rename map
  const [originalCategories, setOriginalCategories] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEditedCategories([...categories]);
      setOriginalCategories([...categories]);
      setEditedAllLabel(allLabel || 'All');
      setNewCatInput('');
      setSaveSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, categories, allLabel]);

  if (!isOpen) return null;

  const handleCategoryChange = (index: number, val: string) => {
    setEditedCategories((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
    setErrorMessage('');
  };

  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (editedCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`Category "${trimmed}" already exists.`);
      return;
    }
    setEditedCategories((prev) => [...prev, trimmed]);
    setNewCatInput('');
    setErrorMessage('');
  };

  const handleDeleteCategory = (index: number) => {
    const catName = editedCategories[index];
    if (editedCategories.length <= 1) {
      setErrorMessage('You must have at least 1 portfolio category.');
      return;
    }
    setEditedCategories((prev) => prev.filter((_, i) => i !== index));
    setErrorMessage('');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setEditedCategories((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === editedCategories.length - 1) return;
    setEditedCategories((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const handleResetDefaults = () => {
    setEditedCategories(['Visual Design', 'Film & Motion', 'Photography', 'Editorial']);
    setEditedAllLabel('All');
    setErrorMessage('');
  };

  const handleSave = () => {
    // Validate
    const cleaned = editedCategories.map((c) => c.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      setErrorMessage('Please provide at least one valid category.');
      return;
    }

    // Check for duplicates
    const unique = new Set(cleaned.map((c) => c.toLowerCase()));
    if (unique.size !== cleaned.length) {
      setErrorMessage('Category names must be unique.');
      return;
    }

    // Build renames array
    const renames: { from: string; to: string }[] = [];
    originalCategories.forEach((orig, idx) => {
      if (cleaned[idx] && cleaned[idx] !== orig) {
        renames.push({ from: orig, to: cleaned[idx] });
      }
    });

    onSave(cleaned, editedAllLabel.trim() || 'All', renames);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Edit Category Tabs
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Rename, reorder, or add gallery category filters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs">
              {errorMessage}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Categories updated and synced successfully!</span>
            </div>
          )}

          {/* Section 1: "All" Filter Tab Label */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
            <label className="block text-xs font-mono uppercase text-zinc-400">
              Overview Filter Tab Label (Displays all projects)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedAllLabel}
                onChange={(e) => setEditedAllLabel(e.target.value)}
                placeholder="All"
                className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono"
              />
              <span className="text-xs font-mono text-zinc-500 px-2">Default: All</span>
            </div>
          </div>

          {/* Section 2: Category List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-zinc-400">
                Gallery Categories ({editedCategories.length})
              </label>
              <span className="text-[11px] font-mono text-zinc-500">
                Click input to edit text directly
              </span>
            </div>

            <div className="space-y-2">
              {editedCategories.map((cat, idx) => {
                const count = photoCounts[cat] ?? 0;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl hover:border-zinc-700 transition-colors"
                  >
                    <span className="w-6 text-center text-xs font-mono text-zinc-500 font-bold shrink-0">
                      #{idx + 1}
                    </span>

                    <input
                      type="text"
                      value={cat}
                      onChange={(e) => handleCategoryChange(idx, e.target.value)}
                      placeholder="Category name"
                      className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 font-sans"
                    />

                    {count > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                        {count} works
                      </span>
                    )}

                    {/* Move Up / Down */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === editedCategories.length - 1}
                        title="Move Down"
                        className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(idx)}
                      title="Delete Category"
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Add Category */}
          <div className="p-4 bg-zinc-900/30 border border-zinc-800/60 rounded-xl space-y-2">
            <label className="block text-xs font-mono uppercase text-zinc-400">
              Add New Category
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="e.g. 3D Spatial Design, Architecture..."
                className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCatInput.trim()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded-lg text-xs font-mono cursor-pointer flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider font-mono cursor-pointer flex items-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Save Categories</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
