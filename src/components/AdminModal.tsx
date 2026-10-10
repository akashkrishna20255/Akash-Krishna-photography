import { useState } from 'react';
import { GalleryPhoto, CategoryType } from '../types/gallery';
import {
  X,
  Lock,
  Unlock,
  Key,
  Mail,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Upload,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  adminEmail: string;
  adminKey: string;
  photos: GalleryPhoto[];
  onLogin: (key: string) => boolean;
  onLogout: () => void;
  onSendResetCode: (email: string) => { success: boolean; code?: string; message: string };
  onVerifyAndReset: (code: string, newKey: string) => { success: boolean; message: string };
  onAddPhoto: (photo: Omit<GalleryPhoto, 'id'>) => void;
  onDeletePhoto: (id: string) => void;
  onEditPhoto: (photo: GalleryPhoto) => void;
  onResetToDefault: () => void;
  onUpdateEmail: (newEmail: string) => void;
}

const CATEGORIES: CategoryType[] = [
  'Visual Design',
  'Film & Motion',
  'Photography',
  'Editorial'
];

export const AdminModal = ({
  isOpen,
  onClose,
  isAdmin,
  adminEmail,
  adminKey,
  photos,
  onLogin,
  onLogout,
  onSendResetCode,
  onVerifyAndReset,
  onAddPhoto,
  onDeletePhoto,
  onEditPhoto,
  onResetToDefault,
  onUpdateEmail
}: AdminModalProps) => {
  if (!isOpen) return null;

  // View state: 'login' | 'forgot-email' | 'verify-code' | 'panel-add' | 'panel-manage' | 'panel-settings'
  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'settings'>('add');
  const [authView, setAuthView] = useState<'login' | 'request-reset' | 'enter-new-key'>('login');

  // Login inputs
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Reset inputs
  const [resetEmail, setResetEmail] = useState(adminEmail);
  const [resetCode, setResetCode] = useState('');
  const [generatedCodeNotification, setGeneratedCodeNotification] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Add photo inputs
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>('Visual Design');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newYear, setNewYear] = useState('2026');
  const [newDescription, setNewDescription] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  // Settings inputs
  const [settingsEmail, setSettingsEmail] = useState(adminEmail);
  const [settingsKey, setSettingsKey] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = onLogin(inputKey);
    if (success) {
      setInputKey('');
    } else {
      setLoginError('Invalid Admin Key. Please check the key or reset via email below.');
    }
  };

  // Quick autofill default key
  const handleAutofillDefault = () => {
    setInputKey(adminKey);
  };

  // Handle Send Reset Code
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    const result = onSendResetCode(resetEmail);
    if (result.success && result.code) {
      setGeneratedCodeNotification(result.code);
      setAuthView('enter-new-key');
      setResetStatus({ type: 'success', text: result.message });
    } else {
      setResetStatus({ type: 'error', text: result.message });
    }
  };

  // Handle Complete Reset
  const handleFinishReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    const result = onVerifyAndReset(resetCode, newKey);
    if (result.success) {
      setResetStatus({ type: 'success', text: result.message });
      setAuthView('login');
      setGeneratedCodeNotification(null);
    } else {
      setResetStatus({ type: 'error', text: result.message });
    }
  };

  // Handle File Upload for New Photo
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNewImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Add Photo Submit
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl.trim()) return;

    onAddPhoto({
      title: newTitle.trim(),
      category: newCategory,
      imageUrl: newImageUrl.trim(),
      year: newYear.trim() || '2026',
      description: newDescription.trim()
    });

    setAddSuccess(true);
    setNewTitle('');
    setNewImageUrl('');
    setNewDescription('');

    setTimeout(() => setAddSuccess(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-zinc-100 my-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-white">
              {isAdmin ? 'Gallery Admin Control Center' : 'Admin Security Access'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Admin Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOT LOGGED IN STATE */}
        {!isAdmin ? (
          <div className="p-6 sm:p-8">
            {authView === 'login' && (
              <div>
                <div className="text-center max-w-md mx-auto mb-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Enter Admin Security Key
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Log in to add new photos, update titles, or manage the gallery.
                  </p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 rounded bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                      Admin Password / Key
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        placeholder="Enter your admin key"
                        required
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 font-mono pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Unlock Admin Panel
                  </button>

                  {/* Convenient Quick Hint & Autofill */}
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <div>
                      <span>Default Key: </span>
                      <strong className="text-amber-400">{adminKey}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutofillDefault}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] rounded transition-colors cursor-pointer"
                    >
                      Autofill Key
                    </button>
                  </div>

                  {/* Reset Link */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('request-reset');
                        setLoginError('');
                      }}
                      className="text-xs text-zinc-400 hover:text-amber-400 transition-colors underline underline-offset-4 cursor-pointer"
                    >
                      Forgot Key? Reset with Email ({adminEmail})
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* REQUEST RESET CODE SCREEN */}
            {authView === 'request-reset' && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Reset Admin Key via Email
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Enter the registered admin email to receive a 4-digit verification code.
                  </p>
                </div>

                {resetStatus && (
                  <div
                    className={`mb-4 p-3 rounded text-xs flex items-center gap-2 ${
                      resetStatus.type === 'error'
                        ? 'bg-red-950/70 border border-red-800 text-red-200'
                        : 'bg-green-950/70 border border-green-800 text-green-200'
                    }`}
                  >
                    <span>{resetStatus.text}</span>
                  </div>
                )}

                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. akashkrishna67@gmail.com"
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Send Verification Code
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ENTER CODE & NEW KEY SCREEN */}
            {authView === 'enter-new-key' && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Set New Admin Key
                  </h3>
                  <p className="text-xs text-zinc-400">
                    A code was sent to <span className="text-amber-400 font-mono">{resetEmail}</span>
                  </p>
                </div>

                {/* Instant Simulation Code Display for Zero Friction */}
                {generatedCodeNotification && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-950/40 border border-amber-800/80 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-zinc-300">Generated Code: </span>
                      <strong className="text-amber-400 text-sm tracking-widest">{generatedCodeNotification}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResetCode(generatedCodeNotification)}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded text-[11px] cursor-pointer"
                    >
                      Autofill Code
                    </button>
                  </div>
                )}

                {resetStatus && (
                  <div
                    className={`mb-4 p-3 rounded text-xs ${
                      resetStatus.type === 'error'
                        ? 'bg-red-950/70 border border-red-800 text-red-200'
                        : 'bg-green-950/70 border border-green-800 text-green-200'
                    }`}
                  >
                    {resetStatus.text}
                  </div>
                )}

                <form onSubmit={handleFinishReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                      4-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 7492"
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                      New Admin Key / Password
                    </label>
                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Enter new admin key"
                      required
                      minLength={4}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Update Key & Login
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel & Return to Login
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* LOGGED IN ADMIN PANEL */
          <div>
            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-950 px-6 gap-2 text-xs font-mono">
              <button
                onClick={() => setActiveTab('add')}
                className={`py-3 px-4 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'add'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`py-3 px-4 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'manage'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <span>Manage Gallery ({photos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-4 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <span>Admin Settings</span>
              </button>

              <button
                onClick={onLogout}
                className="ml-auto py-3 px-3 text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* TAB 1: ADD PHOTO */}
              {activeTab === 'add' && (
                <div>
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-white mb-1">
                      Upload New Photo to Gallery
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Choose an image from your device or paste a web URL. It will be immediately published to your live gallery.
                    </p>
                  </div>

                  {addSuccess && (
                    <div className="mb-4 p-3 rounded-lg bg-green-950/80 border border-green-800 text-green-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Photo published successfully to the gallery!</span>
                    </div>
                  )}

                  <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
                    {/* Image selector */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                        Image File or URL <span className="text-amber-400">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {newImageUrl && (
                          <div className="w-24 h-24 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                            <img
                              src={newImageUrl}
                              alt="Upload preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-grow space-y-2 w-full">
                          <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Paste image URL (or upload below)"
                            required
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-amber-400 font-mono"
                          />

                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-300 cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5 text-amber-400" />
                              <span>Select File from Device</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileUpload}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[11px] text-zinc-500">
                              (Instant client preview)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                        Photo Title <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Sculptural Architecture Series"
                        required
                        className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Category & Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-amber-400"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Year
                        </label>
                        <input
                          type="text"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          placeholder="2026"
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                        Caption / Project Description
                      </label>
                      <textarea
                        rows={2}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Brief artistic description or client context..."
                        className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish Photo to Gallery</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: MANAGE GALLERY */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div>
                      <h3 className="text-base font-bold text-white">Current Gallery Photos</h3>
                      <p className="text-xs text-zinc-400">Click Edit to modify or Delete to remove from gallery.</p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Reset gallery back to original curated photos?')) {
                          onResetToDefault();
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Defaults</span>
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-800/80">
                    {photos.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-zinc-500 font-mono">
                              {item.category} · {item.year}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onEditPhoto(item)}
                            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
                            title="Edit Photo Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${item.title}"?`)) {
                                onDeletePhoto(item.id);
                              }
                            }}
                            className="p-1.5 rounded bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-800 cursor-pointer"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ADMIN SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Admin Security Settings</h3>
                    <p className="text-xs text-zinc-400">
                      Manage registered recovery email and current admin password key.
                    </p>
                  </div>

                  {settingsMessage && (
                    <div className="p-3 rounded bg-zinc-900 border border-amber-400/60 text-amber-400 text-xs">
                      {settingsMessage}
                    </div>
                  )}

                  {/* Registered email */}
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                    <label className="block text-xs font-mono uppercase text-zinc-400">
                      Admin Recovery Email
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={settingsEmail}
                        onChange={(e) => setSettingsEmail(e.target.value)}
                        className="flex-grow px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => {
                          if (settingsEmail.includes('@')) {
                            onUpdateEmail(settingsEmail);
                            setSettingsMessage(`Admin email updated to ${settingsEmail}`);
                            setTimeout(() => setSettingsMessage(''), 3000);
                          }
                        }}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-semibold cursor-pointer"
                      >
                        Save Email
                      </button>
                    </div>
                  </div>

                  {/* Current Key info */}
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                      Current Active Admin Key
                    </span>
                    <span className="text-sm font-mono text-amber-400 font-bold">
                      {adminKey}
                    </span>
                    <p className="text-xs text-zinc-500 mt-1">
                      You can also reset this at any time using the "Reset with Email" flow.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
