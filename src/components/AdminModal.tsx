import { useState, useEffect } from 'react';
import { GalleryPhoto, CategoryType } from '../types/gallery';
import {
  X,
  Lock,
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
  ShieldCheck,
  Eye,
  EyeOff,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  adminEmail: string;
  photos: GalleryPhoto[];
  failedAttempts: number;
  lockoutUntil: number;
  onLogin: (key: string) => Promise<{ success: boolean; message: string; remainingAttempts?: number; lockedMinutes?: number }>;
  onLogout: () => void;
  onSendResetCode: (email: string) => { success: boolean; message: string; code?: string };
  onVerifyAndReset: (code: string, newKey: string) => Promise<{ success: boolean; message: string }>;
  onAddPhoto: (photo: Omit<GalleryPhoto, 'id'>) => void;
  onDeletePhoto: (id: string) => void;
  onEditPhoto: (photo: GalleryPhoto) => void;
  onResetToDefault: () => void;
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
  photos,
  failedAttempts,
  lockoutUntil,
  onLogin,
  onLogout,
  onSendResetCode,
  onVerifyAndReset,
  onAddPhoto,
  onDeletePhoto,
  onEditPhoto,
  onResetToDefault
}: AdminModalProps) => {
  if (!isOpen) return null;

  // View state: 'login' | 'request-reset' | 'enter-new-key'
  const [authView, setAuthView] = useState<'login' | 'request-reset' | 'enter-new-key'>('login');
  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'settings'>('add');

  // Login inputs
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Lockout countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setSecondsRemaining(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setSecondsRemaining(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Reset inputs
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [dispatchedCode, setDispatchedCode] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Add photo inputs
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>('Visual Design');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newYear, setNewYear] = useState('2026');
  const [newDescription, setNewDescription] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  // Settings inputs
  const [changeKeyInput, setChangeKeyInput] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);

    try {
      const res = await onLogin(inputKey);
      if (res.success) {
        setLoginSuccess(true);
        setInputKey('');
      } else {
        setLoginError(res.message);
      }
    } catch (err) {
      setLoginError('Authentication error occurred. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Request Code via Email
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);

    const result = onSendResetCode(resetEmail);
    if (result.success && result.code) {
      setDispatchedCode(result.code);
      setAuthView('enter-new-key');
      setResetStatus({ type: 'success', text: result.message });
    } else {
      setResetStatus({ type: 'error', text: result.message });
    }
  };

  // Handle Verify Code & Set New Admin Key
  const handleFinishReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);

    if (newKey !== confirmKey) {
      setResetStatus({ type: 'error', text: 'Passwords do not match. Please re-enter.' });
      return;
    }

    if (newKey.length < 4) {
      setResetStatus({ type: 'error', text: 'Admin key must be at least 4 characters long.' });
      return;
    }

    setIsResetting(true);
    try {
      const result = await onVerifyAndReset(resetCode, newKey);
      if (result.success) {
        setResetStatus({ type: 'success', text: result.message });
        setAuthView('login');
        setDispatchedCode(null);
        setNewKey('');
        setConfirmKey('');
        setResetCode('');
      } else {
        setResetStatus({ type: 'error', text: result.message });
      }
    } catch (err) {
      setResetStatus({ type: 'error', text: 'Failed to reset key. Please try again.' });
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Image File Upload for New Photo
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

  // Handle Add Photo
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

  const isLockedOut = secondsRemaining > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-zinc-100 my-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-white">
              {isAdmin ? 'Admin Management Center' : 'Secure Admin Authentication'}
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

        {/* NOT LOGGED IN VIEW */}
        {!isAdmin ? (
          <div className="p-6 sm:p-8">
            {/* VIEW 1: LOGIN */}
            {authView === 'login' && (
              <div>
                <div className="text-center max-w-md mx-auto mb-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-white">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">
                    Admin Portal
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Protected by SHA-256 cryptographic security and brute-force mitigation.
                  </p>
                </div>

                {/* Lockout Banner */}
                {isLockedOut && (
                  <div className="mb-5 p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-3">
                    <Clock className="w-5 h-5 shrink-0 text-red-400 animate-spin" />
                    <div>
                      <strong className="block text-white font-semibold">Security Lockout Active</strong>
                      <span>Maximum attempts exceeded. Please wait {secondsRemaining} seconds.</span>
                    </div>
                  </div>
                )}

                {/* Login Error Notification */}
                {loginError && !isLockedOut && (
                  <div className="mb-4 p-3.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Admin Security Key
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={inputKey}
                        disabled={isLockedOut || isAuthenticating}
                        onChange={(e) => setInputKey(e.target.value)}
                        placeholder="Enter your security code"
                        required
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono pr-10 disabled:opacity-50"
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
                    disabled={isLockedOut || isAuthenticating}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAuthenticating ? (
                      <span>Verifying Cryptographic Credentials...</span>
                    ) : (
                      <span>Authenticate Access</span>
                    )}
                  </button>

                  {/* Reset Link - Strictly to User's Email */}
                  <div className="pt-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('request-reset');
                        setLoginError('');
                      }}
                      className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer font-mono"
                    >
                      Forgot Admin Code? Reset via Registered Email
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 2: REQUEST RESET CODE */}
            {authView === 'request-reset' && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">
                    Reset Admin Code
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Enter the Google AI Studio email associated with this site to verify identity.
                  </p>
                </div>

                {resetStatus && (
                  <div
                    className={`mb-4 p-3.5 rounded-lg text-xs flex items-center gap-2.5 ${
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
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Registered Owner Email
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. akashkrishna67@gmail.com"
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                      * Must match the Google AI Studio account email.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Dispatch Secure Reset Code
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-xs text-zinc-400 hover:text-white font-mono"
                    >
                      ← Return to Login
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 3: ENTER CODE & SET NEW ADMIN KEY */}
            {authView === 'enter-new-key' && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">
                    Verify Code & Update Key
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Verification code dispatched to: <span className="text-white font-mono font-semibold">{adminEmail}</span>
                  </p>
                </div>

                {/* Security Notification Banner with Dispatched Code in Preview Environment */}
                {dispatchedCode && (
                  <div className="mb-4 p-3.5 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-zinc-400">Dispatched Code: </span>
                      <strong className="text-white text-sm tracking-widest">{dispatchedCode}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResetCode(dispatchedCode)}
                      className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black text-[11px] font-semibold rounded cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                )}

                {resetStatus && (
                  <div
                    className={`mb-4 p-3.5 rounded-lg text-xs ${
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
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      6-Digit Security Code
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono tracking-widest text-center text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      New Admin Code / Key
                    </label>
                    <input
                      type="password"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Enter new admin code"
                      required
                      minLength={4}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Confirm New Admin Code
                    </label>
                    <input
                      type="password"
                      value={confirmKey}
                      onChange={(e) => setConfirmKey(e.target.value)}
                      placeholder="Re-enter new admin code"
                      required
                      minLength={4}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isResetting ? 'Encrypting & Updating Key...' : 'Confirm & Update Admin Key'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-xs text-zinc-400 hover:text-white font-mono"
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
            {/* Nav Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-950 px-6 gap-2 text-xs font-mono">
              <button
                onClick={() => setActiveTab('add')}
                className={`py-3 px-4 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'add'
                    ? 'border-white text-white'
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
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <span>Manage Gallery ({photos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-4 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <span>Security</span>
              </button>

              <button
                onClick={onLogout}
                className="ml-auto py-3 px-3 text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Admin</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* TAB 1: ADD PHOTO */}
              {activeTab === 'add' && (
                <div>
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-white mb-1 uppercase">
                      Upload New Work to Gallery
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Select a file from your device or paste an image URL. Live changes appear in the gallery immediately.
                    </p>
                  </div>

                  {addSuccess && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Photo published successfully to the live gallery!</span>
                    </div>
                  )}

                  <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
                    {/* Image selector */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                        Image File or URL <span className="text-white">*</span>
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
                            placeholder="Paste image URL (or upload from device below)"
                            required
                            className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white font-mono"
                          />

                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Select from Computer</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileUpload}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[11px] text-zinc-500 font-mono">
                              (Instant preview)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                        Photo / Project Title <span className="text-white">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Minimalist Identity System"
                        required
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white"
                      />
                    </div>

                    {/* Category & Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Year
                        </label>
                        <input
                          type="text"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          placeholder="2026"
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                        Caption / Description
                      </label>
                      <textarea
                        rows={2}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Brief artistic description..."
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
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
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase">Active Gallery Archive</h3>
                      <p className="text-xs text-zinc-400">Click Edit to modify or Delete to remove from gallery.</p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Reset gallery to default curated works?')) {
                          onResetToDefault();
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Default Set</span>
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-800/80">
                    {photos.map((item) => (
                      <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-zinc-900 border border-zinc-800 shrink-0"
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
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
                            title="Edit Photo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${item.title}" from gallery?`)) {
                                onDeletePhoto(item.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-800 cursor-pointer"
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

              {/* TAB 3: SECURITY & EMAIL */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1 uppercase">
                      Security & Recovery Settings
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Configured with SHA-256 cryptographic hashing and brute-force protection.
                    </p>
                  </div>

                  {/* Registered Recovery Email */}
                  <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <span className="text-xs font-mono uppercase text-zinc-400 block">
                      Registered Owner Email
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-white font-semibold">{adminEmail}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-mono">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      All password recovery codes are dispatched exclusively to this address.
                    </p>
                  </div>

                  {/* Cryptographic Protection Status */}
                  <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <span className="text-xs font-mono uppercase text-zinc-400 block">
                      Cryptographic Protection
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>SHA-256 Salted Hash · No plain text stored</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Brute-force protection: 5 attempts max, 5-minute cooldown</span>
                    </div>
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
